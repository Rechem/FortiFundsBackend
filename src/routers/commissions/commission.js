const express = require('express')
const { UnauthroizedError, BadRequestError, NotFoundError } = require('../../core/api-error')
const { SuccessCreationResponse, SuccessResponse } = require('../../core/api-response')
const asyncHandler = require('../../helpers/async-handler')
const { jwtVerifyAuth } = require('../../helpers/jwt-verify-auth')
// const User = require('../../models/user')
const { Commission, MembreCommission, Membre, Demande, Projet, MotifDemande } = require('../../models')
const { roles, flattenObject, statusDemande, statusCommission, getPagination, getPagingData } = require('../../core/utils')
const { ValidationError, Op } = require('sequelize')
const { commissionSchema, acceptCommissionSchema } = require('./schema')
const { sequelize } = require('../../models/index');
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
            throw new BadRequestError()
        }
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

const findCommissionsAndCountAll = async (
    { search, orderBy, sortBy, limit, offset, etat }
) => {
    const rows = await sequelize.query(
        'CALL search_commissions (:search,:etat, :limit, :offset, :sortBy, :orderBy )',
        { replacements: { search, etat, limit, offset, sortBy, orderBy } })
    const count = await sequelize.query('CALL search_commissions_count (:search, :etat)',
        { replacements: { search, etat } })

    return { rows, count: count[0].count }

}

//get comissions
router.get('/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    if (!isAdmin(req) && !isModo(req))
        throw new UnauthroizedError()

    const { limit, offset } = getPagination(req.query.page, req.query.size)

    const reqArgs = {
        search: req.query.search || null,
        limit,
        offset,
        orderBy: req.query.orderBy || null,
        sortBy: req.query.sortBy || null,
        etat: req.query.etat || null,
    }

    const response = await findCommissionsAndCountAll(reqArgs)

    return new SuccessResponse('Liste des Commissions',
        getPagingData(response, req.query.page)).send(res)
}
))

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

            const commission = await Commission.findByPk(req.body.idCommission, {
                include: [{ model: Demande, attributes: ['idDemande'], as: 'demandes' }]
            })

            if (demandes.length !== commission.demandes.length)
                throw new BadRequestError('Il existe des demandes manquantes ou en surplus')

            if (!demandes.every(d => {
                return ((d.etat === statusDemande.accepted
                || d.etat === statusDemande.refused)
                && commission.demandes.find(element => element.idDemande == d.idDemande))
            })) {
                throw new BadRequestError()
            }

            let demandesAccepted = []

            await sequelize.transaction(async (t) => {

                await commission.update({
                    etat: statusCommission.terminee,
                    rapportCommission: sanitizeFileName(req.file.path)
                }, { transaction: t })

                for await (const demande of demandes) {
                    const result = await Demande.findByPk(demande.idDemande)
                    await result.update({ etat: demande.etat }, { transaction: t })
                    if (demande.etat === statusDemande.refused)
                        await MotifDemande.create({
                            contenuMotif:
                                `Votre demande a été refusée après évaluation durant la commission du ${commission.dateCommission}.`,
                            demandeId: demande.idDemande,
                            dateMotif: Date.now(),
                        }, { transaction: t })
                    else
                        demandesAccepted.push({
                            denominationCommerciale: result.denominationCommerciale,
                            idDemande: result.idDemande
                        })
                }
                await Projet.bulkCreate(demandesAccepted.map((d, _) => ({ demandeId: d.idDemande })), { transaction: t,
                    individualHooks: true, })
            })

            new SuccessCreationResponse('Liste des projets créés', { projets: demandesAccepted }).send(res)

        } catch (e) {
            if (e instanceof ValidationError) {
                throw new BadRequestError(e.errors[0].message)
            } else
                throw e

        }
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
            throw new NotFoundError("Commission introuvable")

        new SuccessResponse('Commission', { commission }).send(res)
    }))

module.exports = router