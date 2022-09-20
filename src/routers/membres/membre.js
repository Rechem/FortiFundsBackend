const express = require('express')
const { UnauthroizedError, BadRequestError, NotFoundError, AlreadyExistsError } = require('../../core/api-error')
const { SuccessCreationResponse, SuccessResponse } = require('../../core/api-response')
const asyncHandler = require('../../helpers/async-handler')
const { jwtVerifyAuth } = require('../../helpers/jwt-verify-auth')
const { User, Membre, Commission } = require('../../models')
const { roles } = require('../../core/utils')
const { ValidationError } = require('sequelize')
const sequelize = require('../../database/connection')
const { isAdmin, isModo, isSimpleUser } = require('../../core/utils')
const { membreSchema } = require('./schema')

const router = new express.Router()

router.post('/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    if (isAdmin(req)) {
        try {
            const membreBody = {
                nomMembre: req.body.nomMembre,
                prenomMembre: req.body.prenomMembre,
                emailMembre: req.body.emailMembre,
                // createdBy: req.user.idUser
            }

            const membre = await Membre.findOne({
                where: {
                    nomMembre: req.body.nomMembre,
                    prenomMembre: req.body.prenomMembre
                }
            })

            if (membre)
                throw new AlreadyExistsError('Ce membre existe deja')

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
    if (isAdmin(req) || isModo(req)) {

        let searchInput = req.query.searchInput || ''

        const membres = await sequelize
            .query('CALL search_membres (:search)',
                { replacements: { search: searchInput } })

        new SuccessResponse('Liste des Membres', { membres }).send(res)

    } else {
        throw new UnauthroizedError()
    }
}))

router.delete('/:idMembre', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    if (!isAdmin(req))
        throw new UnauthroizedError()

    const idMembre = req.params.idMembre

    const membre = await Membre.findByPk(idMembre, {
        include: [
            { model: Commission, attributes: ['idCommission'], as: 'commissions' },
            { model: Commission, attributes: ['idCommission'], as: 'commissionsPresidees' },
        ]
    })

    if (!membre)
        throw new NotFoundError('Ce membre n\'existe pas')

    if (membre.commissions.length > 0 || membre.commissionsPresidees.length > 0)
        throw new BadRequestError('Impossible de supprimer ce membre car il est présent dans une ou plusieurs commissions')

    await Membre.destroy({
        where: {
            idMembre: idMembre
        }
    })

    new SuccessResponse('Suppression avec succes').send(res)
}))

router.patch('/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    if (!isAdmin(req))
        throw new UnauthroizedError()

    const { error } = membreSchema.validate(req.body);

    if (error) {
        throw new BadRequestError(error.details[0].message)
    }

    const idMembre = req.body.idMembre

    await Membre.update(
        req.body,
        {
            where: {
                idMembre: idMembre
            }
        })

    new SuccessResponse('Mis a jour avec succes').send(res)
}))

module.exports = router