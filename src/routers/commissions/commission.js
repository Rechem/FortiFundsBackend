const express = require('express')
const { UnauthroizedError, BadRequestError } = require('../../core/api-error')
const { SuccessCreationResponse, SuccessResponse } = require('../../core/api-response')
const asyncHandler = require('../../helpers/async-handler')
const { jwtVerifyAuth } = require('../../helpers/jwt-verify-auth')
const User = require('../../models/user')
const Commission = require('../../models/commission')
const MembreCommission = require('../../models/membre-commission')
const Membre = require('../../models/membre')
const { roles } = require('../../models/utils')
const { ValidationError } = require('sequelize')
const { commissionSchema } = require('./schema')
const sequelize = require('../../database/connection')

const router = new express.Router()

router.post('/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    const role = req.user.role.nomRole
    if (role !== roles.roleAdmin)
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

router.get('/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    const role = req.user.role.nomRole
    if (role !== roles.roleAdmin && role !== roles.roleModerator)
        throw new UnauthroizedError()

    let searchInput = req.query.searchInput || ''

    let commissions = await Commission.findAll({
        attributes: ['idCommission', 'dateCommission', 'etat'],
        include: [{ model: Membre, attributes: ['nomMembre', 'prenomMembre'], as: 'president'}]
    })
    if (commissions.length > 0 && searchInput !== '') {
        searchInput = searchInput.trim()
        commissions = commissions.filter(commission => {
            values = Object.values(commission.toJSON())
            return searchInput.split(' ').every(el => values.some(e => e.startsWith(el)))
        })
    }

    new SuccessResponse('Liste des Commissions', { commissions }).send(res)
}))

module.exports = router