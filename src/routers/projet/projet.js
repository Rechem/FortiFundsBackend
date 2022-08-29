const express = require('express')
const { UnauthroizedError, BadRequestError, NotFoundError } = require('../../core/api-error')
const { SuccessCreationResponse, SuccessResponse } = require('../../core/api-response')
const asyncHandler = require('../../helpers/async-handler')
const { jwtVerifyAuth } = require('../../helpers/jwt-verify-auth')
const { isAdmin, isModo, isSimpleUser, upload, fieldNames, sanitizeFileName } = require('../../core/utils')
const { Projet, Demande, Tranche, User, Commission, Prevision, Realisation } = require('../../models')
const { projetSchema } = require('./schema')


const router = new express.Router()

router.get('/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    let condition

    if (isSimpleUser(req)) {
        condition = { userId: req.user.idUser }
    }

    const projets = await Projet.findAll({
        attributes: ['idProjet', 'montant',],
        include: [
            { model: Prevision, attributes: ['numeroTranche', 'etat'], as: "previsions" },
            { model: Realisation, attributes: ['numeroTranche', 'etat'], as: "realisations" },
            {
                model: Demande, attributes: ['denominationCommerciale', 'avatar'], as: "demande",
                where: condition,
                include: [
                    { model: User, attributes: ['idUser', 'nom', 'prenom'], as: "user" },
                ],
            },
            {
                model: Tranche, attributes: ['nbTranches'], as: "tranche"
            }
        ]
    })

    // if (projets.length > 0 && searchInput !== '') {
    //     searchInput = searchInput.trim()
    //     projets = projets.filter(projet => {
    //         values = Object.values(projet.toJSON())
    //         return searchInput.split(' ').every(el => values.some(e => e.toString().includes(el)))
    //     })
    // }

    new SuccessResponse('Liste des projets', { projets }).send(res)
}))

router.get('/:idProjet', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    const idProjet = req.params.idProjet

    const projet = await Projet.findByPk(idProjet, {
        attributes: ['idProjet', 'montant', 'documentAccordFinancement'],
        include: [
            { model: Prevision, attributes: ['numeroTranche', 'etat'], as: "previsions" },
            { model: Realisation, attributes: ['numeroTranche', 'etat'], as: "realisations" },
            {
                model: Demande,
                attributes: {
                    exclude: ['updatedAt', 'etat', 'avatar', 'seenByUser', 'montant', 'userId', 'commissionId']
                }, as: "demande",
                include: [
                    { model: User, attributes: ['idUser', 'nom', 'prenom'], as: "user" },
                    { model: Commission, attributes: ['idCommission', 'dateCommission'], as: "commission" },
                ],
            },
            {
                model: Tranche, attributes: ['nbTranches'], as: "tranche"
            }
        ]
    })

    if (projet && isAdmin(req) || isModo(req) ||
        (isSimpleUser(req) && projet.demande.user.idUser == req.user.idUser))
        new SuccessResponse('Projet', { projet }).send(res)
    else
        throw new NotFoundError()
}))

router.patch('/:idProjet', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        if (!isAdmin(req))
            throw new UnauthroizedError()
        return next()

    }),
    upload.single(fieldNames.documentAccordFinancement),
    asyncHandler(async (req, res, next) => {

        if (req.file && req.file.path) {
            console.log(req.file.path);
            req.body.documentAccordFinancement = sanitizeFileName(req.file.path)
        }

        const { error } = projetSchema.validate(req.body)

        if (error) {
            throw new BadRequestError(error.details[0].message)
        }
        const idProjet = req.params.idProjet
        const projet = await Projet.findByPk(idProjet)

        if (!Projet)
            throw new NotFoundError()

        await projet.update(req.body)

        new SuccessResponse('Projet mis a jour avec succes').send(res)
    }))

router.patch('/:idProjet/tranche', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    if (!isSimpleUser(req))
        throw new UnauthroizedError()

    const trancheId = req.body.trancheId

    if (!trancheId)
        throw new BadRequestError()

    const tranche = await Tranche.findByPk(trancheId)

    if (!tranche)
        throw new NotFoundError()

    const idProjet = req.params.idProjet

    const projet = await Projet.findByPk(idProjet)

    if (!projet)
        throw new NotFoundError()

    await projet.update({ trancheId })

    new SuccessResponse('Projet mis a jour avec succes').send(res)
}))

router.delete(`/:idProjet/documentAccordFinancement`, jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        if (!isAdmin(req))
            throw new UnauthroizedError()

        const projet = await Projet.findByPk(req.params.idProjet)

        if (!projet)
            throw new NotFoundError()

        await projet.update({
            documentAccordFinancement: null
        })

        return new SuccessResponse('Projet mis a jour avec succes').send(res)
    }
    ))

module.exports = router