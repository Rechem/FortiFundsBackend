const express = require('express')
const { UnauthroizedError, BadRequestError, NotFoundError } = require('../../core/api-error')
const { SuccessCreationResponse, SuccessResponse } = require('../../core/api-response')
const asyncHandler = require('../../helpers/async-handler')
const { jwtVerifyAuth } = require('../../helpers/jwt-verify-auth')
// const User = require('../../models/user')
const { Commission, MembreCommission, Membre, Demande, Projet } = require('../../models')
const { roles, flattenObject, statusDemande, statusCommission } = require('../../core/utils')
const { ValidationError, Op } = require('sequelize')
const { commissionSchema, acceptCommissionSchema } = require('./schema')
const sequelize = require('../../database/connection')
const multer = require('multer')
const path = require('path')
const { isAdmin, isModo, isSimpleUser, fieldNames, upload, sanitizeFileName } = require('../../core/utils')
const _ = require('lodash')
const dayjs = require('dayjs')

const router = new express.Router()

//create commission
router.post('/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    if (!isAdmin(req))
        throw new UnauthroizedError()

    try {
        const { error } = commissionSchema.validate(req.body);
        if (error) {
            console.log("here ?", error);
            throw new BadRequestError()
        }
        console.log("here ?")
        await sequelize.transaction(async (t) => {

            const commissionBody = {
                presidentId: req.body.president,
                dateCommission: req.body.dateCommission,
                createdBy: req.user.idUser
            }
            const commission = await Commission.create(commissionBody, { transaction: t })

            const membres = req.body.membres;

            for await (const membre of membres) {
                const membreCommissionBody = {
                    idCommission: commission.idCommission,
                    idMembre: membre
                }
                await MembreCommission.create(membreCommissionBody, { transaction: t })
            };

        })
        new SuccessCreationResponse('Commission créé avec succès').send(res)

    } catch (e) {

        if (e instanceof ValidationError) {
            throw new BadRequestError(e.errors[0].message)
        } else
            throw e
    }
}))

//get comissions
router.get('/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    if (!isAdmin(req) && !isModo(req))
        throw new UnauthroizedError()

    let searchInput = req.query.searchInput || ''

    let commissions = await Commission.findAll({
        attributes: ['idCommission', 'dateCommission', 'etat',
            [sequelize.fn('COUNT', sequelize.col('demandes.commissionId')), 'nbDemandes']],
        include: [
            { model: Membre, attributes: ['nomMembre', 'prenomMembre'], as: 'president' },
            { model: Demande, attributes: [], as: "demandes" },
        ],
        group: ['idCommission'],
    })

    if (commissions.length > 0 && searchInput !== '') {
        const fields = [
            "dateCommission",
            "president.nomMembre",
            "president.prenomMembre",
            "nbDemandes",
        ]

        searchInput = searchInput.toLowerCase().trim()
        commissions = commissions.filter(commission => {
            let commissionString = _.pick(flattenObject(commission.toJSON()), fields)
            commissionString.nbDemandes = commissionString.nbDemandes.toString()
            values = Object.values(commissionString)
            return searchInput.split(' ').every(el => values.some(e => e.toLowerCase().includes(el)))
        })
    }

    new SuccessResponse('Liste des Commissions', { commissions }).send(res)
}))

//get commission by id
router.get('/:idCommission', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        if (!isAdmin(req) && !isModo(req))
            throw new UnauthroizedError()

        const idCommission = req.params.idCommission

        const commission = await Commission.findOne({
            where: { idCommission },
            attributes: ['idCommission', 'dateCommission', 'etat', 'rapportCommission'],
            include: [
                { model: Membre, attributes: ['idMembre', 'nomMembre', 'prenomMembre'], as: 'president' },
                { model: Membre, attributes: ['idMembre', 'nomMembre', 'prenomMembre'], through: { attributes: [], }, as: 'membres' },
                {
                    model: Demande, attributes: ['idDemande', 'etat', 'denominationCommerciale',
                        'formeJuridique', 'montant'], as: 'demandes'
                },
            ],
        })

        if (!commission)
            throw new NotFoundError("Demande introuvable")

        new SuccessResponse('Commission', { commission }).send(res)
    }))

//update commission
router.patch('/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    if (!isAdmin(req))
        throw new UnauthroizedError()

    try {
        const { error } = commissionSchema.validate(req.body);
        if (error) {
            throw new BadRequestError()
        }

        const commission = await Commission.findOne({
            where: { idCommission: req.body.idCommission },
            include: [{ model: Membre, attributes: ['idMembre'], through: { attributes: [], }, as: 'membres' },]
        })

        if (!commission)
            throw new NotFoundError()

        await sequelize.transaction(async (t) => {

            await commission.update({
                presidentId: req.body.president,
                dateCommission: req.body.dateCommission
            }, { transaction: t })

            const originalMembres = commission.membres.map((e, i) => e.idMembre)
            const membres = req.body.membres

            const membresToDelete = originalMembres.filter(x => !membres.includes(x))
            const membresToAdd = membres.filter(x => !originalMembres.includes(x))

            await MembreCommission.destroy({
                where: {
                    idMembre: {
                        [Op.in]: membresToDelete
                    }
                }
            }, { transaction: t })

            for await (const membre of membresToAdd) {
                const membreCommissionBody = {
                    idCommission: commission.idCommission,
                    idMembre: membre
                }
                await MembreCommission.create(membreCommissionBody, { transaction: t })
            }
        })

    } catch (e) {
        if (e instanceof ValidationError) {
            throw new BadRequestError(e.errors[0].message)
        } else
            throw e

    }

    new SuccessResponse().send(res)

}))

//end commission
router.patch('/accept', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        if (!isAdmin(req))
            throw new UnauthroizedError()
        return next()
    }),
    upload.single(fieldNames.rapportCommission),
    asyncHandler(async (req, res, next) => {
        if (!req.file)
            throw new BadRequestError('Format de fichier invalide.')

        try {
            const { error } = acceptCommissionSchema.validate(req.body);
            if (error) {
                throw new BadRequestError()
            }

            //because formdata thats why
            const demandes = JSON.parse(req.body.demandes)

            if (!demandes.every(d => d.etat === statusDemande.accepted || d.etat === statusDemande.refused)) {
                throw new BadRequestError()
            }

            let nomProjets = []

            await sequelize.transaction(async (t) => {

                const commission = await Commission.findByPk(req.body.idCommission)
                await commission.update({
                    etat: statusCommission.terminee,
                    rapportCommission: sanitizeFileName(req.file.path)
                }, { transaction: t })

                for await (const demande of demandes) {
                    const result = await Demande.findByPk(demande.idDemande)
                    await result.update({ etat: demande.etat }, { transaction: t })
                    nomProjets.push(result.denominationCommerciale)
                }
                await Projet.bulkCreate(demandes.map((d, _) => ({ demandeId: d.idDemande })), { transaction: t })
            })

            new SuccessCreationResponse('Liste des projets créés', { projets: nomProjets }).send(res)

        } catch (e) {
            if (e instanceof ValidationError) {
                throw new BadRequestError(e.errors[0].message)
            } else
                throw e

        }
    }))

module.exports = router