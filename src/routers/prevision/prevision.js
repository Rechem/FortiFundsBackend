const express = require('express')
const { UnauthroizedError, BadRequestError, NotFoundError } = require('../../core/api-error')
const { SuccessCreationResponse, SuccessResponse } = require('../../core/api-response')
const asyncHandler = require('../../helpers/async-handler')
const { jwtVerifyAuth } = require('../../helpers/jwt-verify-auth')
const { isAdmin, isModo, isSimpleUser, statusPrevision, upload, fieldNames } = require('../../core/utils')
const { Prevision, Projet, Tranche, TypeInvestissement, Investissement } = require('../../models')
const { previsionSchema, investissementSchema } = require('./schema')
const sequelize = require('sequelize')

const router = new express.Router()

// router.get('/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
//     const previsions = await Prevision.findAll()

//     new SuccessResponse('List des previsions', { previsions }).send(res)
// }))

// ADD PROTECTION LIKE WHO CAN VISUALIZE PREVISION AND WHO CAN ADD

router.get('/typesinvestissements', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    const typesInvestissement = await TypeInvestissement.findAll()

    new SuccessResponse('List des types d\'investissements', { typesInvestissement }).send(res)
}))

router.get('/:projectId/:numeroTranche/investissements', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    const projetId = req.params.projectId
    const numeroTranche = req.params.numeroTranche

    const investissements = await Investissement.findAll({
        where : {projetId, numeroTranche},
        include: [
            { model: TypeInvestissement, attributes: ['nomType'], as: 'type' }
        ]
    })

    new SuccessResponse('List des investissements', { investissements }).send(res)
}))

router.post('/investissements', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        if (!isSimpleUser(req))
            throw new UnauthroizedError()
        return next()
    }),
    upload.single(fieldNames.factureArticlePrevision),
    asyncHandler(async (req, res, next) => {
        const { error } = investissementSchema.validate(req.body)
        if (error)
            throw new BadRequestError(error.details[0].message)

        let investissementBody = {
            projetId : req.body.projetId,
            numeroTranche: req.body.numeroTranche,
            typeInvestissementId: req.body.idTypeInvestissement,
            description: req.body.description,
            montantUnitaire: req.body.montantUnitaire,
            quantite: req.body.quantite,
        }

        if (req.body.lienOuFacture === 'lien') {
            investissementBody.lien = req.body.lien
        } else if (req.body.lienOuFacture === 'facture') {
            if (req.file)
                investissementBody.facture = req.file.path
            else
                throw new BadRequestError('Facture non fournie')
        }

        await Investissement.create(investissementBody)

        new SuccessCreationResponse('Investissement crée avec succes').send(res)

    }),
)

router.post('/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    //add checking that realisations are done before reating new prevision
    if (!isAdmin(req))
        throw new UnauthroizedError()

    const { error } = previsionSchema.validate(req.body)
    if (error)
        throw new BadRequestError(error.details[0].message)

    const projet = await Projet.findByPk(req.body.projetId, {
        include: { model: Tranche, attributes: ['nbTranches'], as: 'tranche' }
    })

    if (!projet)
        throw NotFoundError("Ce projet n'existe pas")

    if (!projet.tranche)
        throw new BadRequestError("Tranches non assignées au projet")

    const result = await Prevision.findOne({
        attributes: [[sequelize.fn('MAX', sequelize.col('prevision.numeroTranche')), 'maxTranche']],
        where: { projetId: projet.idProjet }
    })

    const maxTranche = result.toJSON().maxTranche || 0

    if (projet.tranche.nbTranches <= maxTranche )
        throw new BadRequestError("Le numéro de tranche ne peut pas excéder le nombre total de tranches")

    const previsionBody = {
        numeroTranche: maxTranche + 1,
        projetId: req.body.projetId,
        etat: statusPrevision.brouillon,
    }

    await Prevision.create(previsionBody)

    new SuccessCreationResponse('Prévision créé avec succès').send(res)
}))

module.exports = router