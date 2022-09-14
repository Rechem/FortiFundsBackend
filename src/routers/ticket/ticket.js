const express = require('express')
const { UnauthroizedError, BadRequestError, NotFoundError, InternalError } = require('../../core/api-error')
const { SuccessCreationResponse, SuccessResponse } = require('../../core/api-response')
const asyncHandler = require('../../helpers/async-handler')
const { jwtVerifyAuth } = require('../../helpers/jwt-verify-auth')
const { isAdmin, isModo, sanitizeFileName, isSimpleUser, statusPrevision, upload, fieldNames, statusRealisation, statusTicket } = require('../../core/utils')
const { Ticket, Message, User } = require('../../models')
const db = require('../../models');
const _ = require('lodash')
const { ticketSchema, messageSchema, ticketPatchSchema } = require('./schema')
const sequelize = require('../../database/connection')
const { getPagination, getPagingData } = require('../../core/utils')

const router = new express.Router()

router.post('/', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        if (!isSimpleUser(req))
            throw new UnauthroizedError()

        const { error } = ticketSchema.validate()
        if (error)
            throw new BadRequestError(error.details[0].message)

        await sequelize.transaction(async t => {
            const ticket = await Ticket.create({
                userId: req.user.idUser,
                motif: req.body.motif,
                objet: req.body.objet,
            }, { transaction: t })

            await Message.create({
                ticketId: ticket.idTicket,
                senderId: req.user.idUser,
                contenu: req.body.contenu
            }, { transaction: t })
        })

        return new SuccessCreationResponse('Ticket ajouté avec succès').send(res)
    }))

router.get('/', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {

        let searchInput = req.query.searchInput || ''

        const { search, orderBy, sortBy, page, size, } = req.query

        const { limit, offset } = getPagination(page, size)

        let rows;
        let count;

        if (isSimpleUser(req)) {
            rows = await sequelize.query('CALL search_tickets_by_id (:search, :IdUserParam)',
                { replacements: { search: searchInput, IdUserParam: req.user.idUser } })
            count = await Ticket.count()
        } else {
            rows = await sequelize.query('CALL search_tickets (:search)',
                { replacements: { search: searchInput } })
            count = await Ticket.count()
        }

        return new SuccessResponse('Ticket',
            getPagingData({ rows, count }, page, limit)
        ).send(res)

    }))

router.get('/:idTicket', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {

        const idTicket = req.params.idTicket

        const ticket = await Ticket.findByPk(idTicket, {
            include: [{
                model: Message, attributes: { exclude: ['ticketId', 'userId'], },
                include: [{
                    model: User, attributes: ['prenom',
                        'nom', 'avatar'], as: 'sentBy'
                }], as: 'messages'
            }],
        })

        if (!ticket)
            throw new NotFoundError('Ce ticket n\'existe pas')

        if (!(isAdmin(req) || isModo(req)
            || (isSimpleUser(req) && ticket.userId === req.user.idUser)))
            throw new UnauthroizedError()

        return new SuccessResponse('Ticket', { ticket }).send(res)

    }))

router.post('/:idTicket', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {

        const idTicket = req.params.idTicket

        const { error } = messageSchema.validate()
        if (error)
            throw new BadRequestError(error.details[0].message)

        const ticket = await Ticket.findByPk(idTicket, { attributes: ['idTicket', 'userId'] })

        if (!ticket)
            throw new NotFoundError('Ce ticket n\'existe pas')

        if (ticket.etat === statusTicket.ferme)
            throw new UnauthroizedError('Ce ticket est fermé')

        if (!(isAdmin(req) || isModo(req)
            || (isSimpleUser(req) && ticket.userId == req.user.idUser)))
            throw new UnauthroizedError()

        await Message.create({ ...req.body, senderId: req.user.idUser, ticketId: idTicket })


        return new SuccessResponse('Ticket', { ticket }).send(res)

    }))

router.patch('/:idTicket', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {

        if (!isAdmin(req) && !isModo(req))
            throw new UnauthroizedError()

        const idTicket = req.params.idTicket

        const { error } = ticketPatchSchema.validate()
        if (error)
            throw new BadRequestError(error.details[0].message)

        const ticket = await Ticket.findByPk(idTicket, { attributes: ['idTicket'] })

        if (!ticket)
            throw new NotFoundError('Ce ticket n\'existe pas')

        if (ticket.etat === statusTicket.ferme)
            throw new UnauthroizedError('Ce ticket est fermé')

        await ticket.update(req.body)

        return new SuccessResponse('Succès').send(res)

    }))

module.exports = router