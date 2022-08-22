const express = require('express')
const { UnauthroizedError, BadRequestError, NotFoundError } = require('../../core/api-error')
const { SuccessCreationResponse, SuccessResponse } = require('../../core/api-response')
const asyncHandler = require('../../helpers/async-handler')
const { jwtVerifyAuth } = require('../../helpers/jwt-verify-auth')
const { isAdmin, isModo, isSimpleUser } = require('../../core/utils')
const { Projet, Demande, Tranche, User, Commission } = require('../../models')

const router = new express.Router()

router.get('/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    if (!isModo(req) && !isAdmin(req))
        throw new UnauthroizedError()

    const projets = await Projet.findAll({
        attributes: ['idProjet', 'montant'],
        include: [
            {
                model: Demande, attributes: ['denominationCommerciale', 'avatar'], as: "demande",
                include: [{ model: User, attributes: ['idUser', 'nom', 'prenom'], as: "user" }],
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
    if (!isModo(req) && !isAdmin(req))
        throw new UnauthroizedError()

    const idProjet = req.params.idProjet

    const projet = await Projet.findByPk(idProjet, {
        attributes: ['idProjet', 'montant'],
        include: [
            {
                model: Demande,
                attributes: {
                    exclude: ['updatedAt', 'avatar', 'seenByUser', 'montant', 'userId', 'commissionId']
                }, as: "demande",
                include: [
                    { model: User, attributes: ['idUser', 'nom', 'prenom'], as: "user" },
                    { model: Commission, attributes: ['idCommission', 'dateCommission'], as: "commission" }
                ],
            },
            {
                model: Tranche, attributes: ['nbTranches'], as: "tranche"
            }
        ]
    })

    if(!projet)
    throw new NotFoundError()

    // if (projets.length > 0 && searchInput !== '') {
    //     searchInput = searchInput.trim()
    //     projets = projets.filter(projet => {
    //         values = Object.values(projet.toJSON())
    //         return searchInput.split(' ').every(el => values.some(e => e.toString().includes(el)))
    //     })
    // }

    new SuccessResponse('Projet', { projet }).send(res)
}))

module.exports = router