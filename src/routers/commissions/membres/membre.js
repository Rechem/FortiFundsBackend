const express = require('express')
const { UnauthroizedError, BadRequestError } = require('../../../core/api-error')
const { SuccessCreationResponse, SuccessResponse } = require('../../../core/api-response')
const asyncHandler = require('../../../helpers/async-handler')
const { jwtVerifyAuth } = require('../../../helpers/jwt-verify-auth')
const User = require('../../../models/user')
const Membre = require('../../../models/membre')
const { roles } = require('../../../models/utils')
const { ValidationError } = require('sequelize')

const router = new express.Router()

router.post('/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    const role = await User.getRole(req.user)
    if (role === roles.roleAdmin) {
        try {
            const membreBody = {
                nomMembre: req.body.nom,
                prenomMembre: req.body.prenom,
                emailMembre: req.body.email,
            }

            await Membre.create(membreBody)

            new SuccessCreationResponse('Membre créé avec succès').send(res)

        } catch (e) {

            if (e instanceof ValidationError) {
                throw new BadRequestError(e.errors[0].message)
            } else
                throw e
        }

    } else {
        throw new UnauthroizedError()
    }
}))

router.get('/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    const role = await User.getRole(req.user)
    if (role === roles.roleAdmin || role === roles.roleModerator) {

        let searchInput = req.query.searchInput || ''
        
        let membres = await Membre.findAll()

        if (membres.length > 0 && searchInput !== '') {
            searchInput = searchInput.trim()
            membres = membres.filter(e=>{
                return e.nomMembre.includes(searchInput)
                || e.prenomMembre.includes(searchInput)
                || e.emailMembre.includes(searchInput)
            })
        }

        new SuccessResponse('Liste des Membres', { membres }).send(res)

    } else {
        throw new UnauthroizedError()
    }
}))

module.exports = router