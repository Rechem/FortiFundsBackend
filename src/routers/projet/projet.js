const express = require('express')
const { UnauthroizedError, BadRequestError, NotFoundError } = require('../../core/api-error')
const { SuccessCreationResponse, SuccessResponse } = require('../../core/api-response')
const asyncHandler = require('../../helpers/async-handler')
const { jwtVerifyAuth } = require('../../helpers/jwt-verify-auth')
const { isAdmin, isModo, isSimpleUser, upload, fieldNames, sanitizeFileName, getPagination } = require('../../core/utils')
const { Projet, Demande, Tranche, User, Commission, Prevision, Realisation, Revenu }
    = require('../../models')
const { projetSchema } = require('./schema')
const sequelize = require('../../database/connection')
const { Op } = require('sequelize')


const router = new express.Router()

router.get('/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {

    let idUser = null

        if (isSimpleUser(req)) {
            idUser = req.user.idUser
        } else {
            if (req.query.idUser) {
                idUser = req.query.idUser
            }
        }

    const { limit, offset } = getPagination(req.query.page, req.query.size)

    const reqArgs = {
        search: req.query.search || null,
        limit,
        offset,
        orderBy: req.query.orderBy || null,
        sortBy: req.query.sortBy || null,
        idUser,
    }

    // const orderFilter = reqArgs.orderBy ? reqArgs.sortBy ?
    //     [reqArgs.sortBy, reqArgs.orderBy] : [reqArgs.sortBy, 'DESC'] : ['createdAt', 'DESC']

    const projetsIds = await Projet.findAll({
        attributes: ['idProjet', 'montant',
            [sequelize.literal('(SELECT COALESCE(sum(articlesrevenu.montant),0) FROM articlesrevenu WHERE articlesrevenu.projetId = Projet.idProjet)'), "totalRevenu"]],
        include: [
            {
                model: Demande, attributes: ['denominationCommerciale'], as: "demande",
                include: [
                    {
                        model: User, attributes: ['nom', 'prenom', 'email'], as: "user",
                    }
                ],
            },
        ],
        where: reqArgs.idUser === null ? true
            : sequelize.where(sequelize.col("demande.user.idUser"), {
                [Op.eq]: reqArgs.idUser
            }
            ),
        having: {
            [Op.or]: [
                sequelize.where(
                    sequelize.col("totalRevenu"), {
                    [Op.like]: '%' + (reqArgs.search || '') + '%'
                }),
                sequelize.where(
                    sequelize.col("demande.user.email"), {
                    [Op.like]: '%' + (reqArgs.search || '') + '%'
                }),
                sequelize.where(
                    sequelize.fn("concat",
                        sequelize.col("demande.user.nom"),
                        ' ',
                        sequelize.col("demande.user.prenom")), {
                    [Op.like]: '%' + (reqArgs.search || '') + '%'
                }),
                sequelize.where(
                    sequelize.fn("concat",
                        sequelize.col("demande.user.prenom"),
                        ' ',
                        sequelize.col("demande.user.nom")), {
                    [Op.like]: '%' + (reqArgs.search || '') + '%'
                }),
                sequelize.where(sequelize.col("demande.denominationCommerciale"), {
                    [Op.like]: '%' + reqArgs.search + '%'
                }
                ),
                sequelize.where(
                    sequelize.fn("COALESCE", sequelize.col("Projet.montant"), 0), {
                    [Op.like]: '%' + reqArgs.search + '%'
                }
                )
            ],
        },
        order: [isSimpleUser(req) ?  ['urgentUser', 'DESC'] : ['urgentAdmin', 'DESC'], 
    ['updatedAt', 'DESC']],
        limit: reqArgs.limit,
        offset: reqArgs.offset,
        subQuery: false
    })

    const count = await sequelize.query(
        'CALL search_projets_count (:search, :idUser)',
        { replacements: { search: reqArgs.search, idUser: reqArgs.idUser } })

    const idsToFetch = projetsIds.reduce((p, c) =>  p.concat(c.idProjet), [])

    const projets = await Projet.findAll({
        attributes: ['idProjet', 'montant', 'documentAccordFinancement',
            [sequelize.literal('(SELECT COALESCE(sum(articlesrevenu.montant),0) FROM articlesrevenu WHERE articlesrevenu.projetId = Projet.idProjet)'), "totalRevenu"]],
        include: [
            { model: Prevision, attributes: ['numeroTranche', 'etat', 'seenByUser'], as: "previsions" },
            { model: Realisation, attributes: ['numeroTranche', 'etat', 'seenByUser'], as: "realisations" },
            { model: Revenu, attributes: ['etat', 'seenByUser'], as: "revenuProjet" },
            {
                model: Demande, attributes: ['denominationCommerciale', 'avatar'], as: "demande",
                include: [
                    {
                        model: User, attributes: ['idUser', 'nom', 'prenom', 'email'], as: "user",
                    }
                ],
            },
            {
                model: Tranche, attributes: ['nbTranches'], as: "tranche"
            }
        ],
        where: {
            idProjet: {
                [Op.in]: idsToFetch
            }
        },
        order: [isSimpleUser(req) ?  ['urgentUser', 'DESC'] : ['urgentAdmin', 'DESC'], 
        ['updatedAt', 'DESC']],
    })

    return new SuccessResponse('Liste des projets', {
        projets,
        count: count[0].count
    }).send(res)
}))

router.get('/:idProjet', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    const idProjet = req.params.idProjet

    const projet = await Projet.findByPk(idProjet, {
        attributes: ['idProjet', 'montant', 'documentAccordFinancement'],
        include: [
            { model: Prevision, attributes: ['numeroTranche', 'etat','seenByUser'], as: "previsions" },
            { model: Realisation, attributes: ['numeroTranche', 'etat', 'seenByUser'], as: "realisations" },
            { model: Revenu, attributes: ['etat', 'seenByUser'], as: "revenuProjet" },
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

    if (projet && (isAdmin(req) || isModo(req) ||
        (isSimpleUser(req) && projet.demande.user.idUser == req.user.idUser)))
        return new SuccessResponse('Projet', { projet }).send(res)
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

        await sequelize.transaction(async t => {

            await projet.update(req.body, {transaction : t})
        })

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

    if (!projet || projet.trancheId)
        throw new NotFoundError()
        
    await sequelize.transaction(async t => {
        
        await projet.update({ trancheId }, {transaction : t})
    })

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