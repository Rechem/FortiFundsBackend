const express = require('express')
const { UnauthroizedError, BadRequestError, NotFoundError, InternalError } = require('../../core/api-error')
const { SuccessCreationResponse, SuccessResponse } = require('../../core/api-response')
const asyncHandler = require('../../helpers/async-handler')
const { jwtVerifyAuth } = require('../../helpers/jwt-verify-auth')
const { isAdmin, isModo, isSimpleUser, upload, fieldNames,
    sanitizeFileName, statusArticleRevenu, deleteFile } = require('../../core/utils')
const { ArticleRevenu, Projet, Demande, MotifRevenu, Revenu } = require('../../models')
const db = require('../../models');
const { articleRevenuSchema, articleRevenuPatchSchema } = require('./schema')
const sequelize = require('../../database/connection')
const _ = require('lodash')
const revenu = require('../../models/revenu')

const router = new express.Router()

router.patch('/seenByUser/:projetId/', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {

        const projetId = req.params.projetId

        if (!isSimpleUser(req))
            throw new UnauthroizedError()

        const projet = await Projet.findByPk(projetId, {
            attributes: ['idProjet'],
            include: [{ model: Revenu, attributes: ['seenByUser'], as: 'revenuProjet' },
            { model: Demande, attributes: ['userId'], as: 'demande' }]
        })

        if (!projet)
            throw new NotFoundError()

        if (projet.demande.userId !== req.user.idUser)
            throw new NotFoundError()

        if (!projet.revenuProjet)
            throw new NotFoundError()

        if (!projet.revenuProjet.seenByUser) {
            await sequelize.transaction(async t => {

                await Revenu.update({ seenByUser: true }, {where: {
                    projetId,
                }, transaction: t,
                individualHooks: true, })
            })
        }

        return new SuccessResponse('Succes').send(res)

    }))


router.post('/', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        if (!isSimpleUser(req))
            throw new UnauthroizedError()
        next()
    }),
    upload.single(fieldNames.factureArticleRevenu),
    asyncHandler(async (req, res, next) => {

        const { error } = articleRevenuSchema.validate(req.body)
        if (error)
            throw new BadRequestError(error.details[0].message)

        const projetId = req.body.projetId

        const projet = await Projet.findByPk(projetId, {
            attributes: ['idProjet'],
            include: [
                {
                    model: Demande, attributes: ["userId"], as: "demande"
                }
            ]
        })

        if (!projet)
            throw new NotFoundError()

        if (projet.demande.userId !== req.user.idUser)
            throw new NotFoundError()

        let body = {
            projetId,
            description: req.body.description,
            dateDebut: req.body.dateDebut,
            dateFin: req.body.dateFin,
            montant: req.body.montant,
            etat: statusArticleRevenu.pending,
        }

        if (req.body.lienOuFacture === 'lien') {
            if (!req.body.lien)
                throw new BadRequestError('Lien non fourni')
            body.lien = req.body.lien
        } else if (req.body.lienOuFacture === 'facture') {
            if (req.file) {
                body.facture = sanitizeFileName(req.file.path)
            } else
                throw new BadRequestError('Facture non fournie')
        }
        await sequelize.transaction(async t => {
            await ArticleRevenu.create(body, { transaction: t })
        })


        new SuccessCreationResponse('Revenu ajouté avec succès').send(res)
    }))

router.patch('/:projetId/:idArticleRevenu', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        if (!isAdmin(req) && !isSimpleUser(req))
            throw new UnauthroizedError()
        next()
    }),
    upload.single(fieldNames.factureArticleRevenu),
    asyncHandler(async (req, res, next) => {

        const projetId = req.params.projetId
        const idArticleRevenu = req.params.idArticleRevenu

        const projet = await Projet.findByPk(projetId, {
            attributes: ['idProjet'],
            include: [
                {
                    model: Demande, attributes: ["userId"], as: "demande"
                }
            ]
        })

        if (!projet)
            throw new NotFoundError()

        if (isSimpleUser(req) && projet.demande.userId !== req.user.idUser)
            throw new NotFoundError()

        const articleRevenu = await ArticleRevenu.findOne({
            where: {
                projetId,
                idArticleRevenu
            }
        })

        if (!articleRevenu)
            throw new NotFoundError()

        if (!(req.body.etat))
            throw new BadRequestError('Etat requis')

        let body = {}
        await sequelize.transaction(async (t) => {

            switch (req.body.etat) {
                case statusArticleRevenu.pending:
                    if (!isSimpleUser(req) || articleRevenu.etat != statusArticleRevenu.refused)
                        throw new UnauthroizedError()

                    const { error } = articleRevenuPatchSchema.validate(req.body)

                    if (error)
                        throw new BadRequestError(error.details[0].message)

                    if (!req.body.lienOuFacture)
                        throw new BadRequestError()

                    body = {
                        description: req.body.description,
                        dateDebut: req.body.dateDebut,
                        dateFin: req.body.dateFin,
                        montant: req.body.montant,
                        etat: statusArticleRevenu.pending
                    }

                    if (req.body.lienOuFacture === 'lien') {
                        if (!req.body.lien)
                            throw new BadRequestError('Lien non fourni')
                        body.lien = req.body.lien
                        if (articleRevenu.facture) {
                            fileNameToDelete = articleRevenu.facture.replace(/^\\uploads/g, 'public')
                            deleteFile(fileNameToDelete)
                            body.facture = null
                        }
                    } else if (req.body.lienOuFacture === 'facture') {
                        body.lien = null
                        if (req.file) {
                            body.facture = sanitizeFileName(req.file.path)
                            if (articleRevenu.facture) {
                                fileNameToDelete = articleRevenu.facture.replace(/^\\uploads/g, 'public')
                                deleteFile(fileNameToDelete)
                            }
                        } else {
                            if (!articleRevenu.facture)
                                throw new BadRequestError('Facture non fournie')
                        }
                    }

                    await articleRevenu.update(body, { transaction: t })
                    break;
                case statusArticleRevenu.accepted:
                    if (!isAdmin(req) || (articleRevenu.etat != statusArticleRevenu.pending
                        && articleRevenu.etat != statusArticleRevenu.refused))
                        throw new UnauthroizedError()

                    body = {
                        etat: statusArticleRevenu.accepted
                    }
                    await articleRevenu.update(body, { transaction: t })

                    break;
                case statusArticleRevenu.refused:
                    if (!isAdmin(req) || articleRevenu.etat != statusArticleRevenu.pending ||
                        !req.body.message)
                        throw new UnauthroizedError()

                    body = {
                        etat: statusArticleRevenu.refused
                    }

                    const message = req.body.message

                    if (!message)
                        throw new BadRequestError('Vous devez spécifier le motif de refus')

                    await articleRevenu.update(body, { transaction: t })

                    await MotifRevenu.create({
                        contenuMotif: message,
                        projetId,
                        idArticleRevenu,
                        dateMotif: Date.now(),
                    }, { transaction: t })

                    //ADD MESSAGE IN TRANSACATION

                    break;
                default:
                    break;
            }
        })

        new SuccessCreationResponse('Succès').send(res)
    }))

router.get('/:projetId', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        if (!isSimpleUser(req) && !isAdmin(req))
            throw new UnauthroizedError()

        const projetId = req.params.projetId

        const projet = await Projet.findByPk(projetId, {
            attributes: ['idProjet'],
            include: [
                {
                    model : Revenu, as : 'revenuProjet',
                    model: Demande, attributes: ["userId", "denominationCommerciale"], as: "demande"
                }
            ]
        })

        if (!projet)
            throw new NotFoundError()

        if (!isAdmin(req) && (!isSimpleUser(req) || projet.demande.userId !== req.user.idUser))
            throw new NotFoundError()

        const revenus = await ArticleRevenu.findAll({
            where: {
                projetId,
            },
        })

        const valeur = await ArticleRevenu.findOne({
            where: {
                projetId,
            },
            attributes: [[sequelize.fn('SUM', sequelize.col('montant')), 'total']],
        })

        return new SuccessResponse('Liste des revenus', {
            revenu: { 
                revenu : projet.toJSON().revenuProjet,
                revenus,
                valeur: valeur.toJSON().total || 0, },
            projet: _.pick(projet.toJSON(), ['idProjet', 'demande.denominationCommerciale']
            )
        }).send(res)
    }))

router.delete('/:projetId/:idArticleRevenu',
    jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        if (!isSimpleUser(req))
            throw new UnauthroizedError()

        const projetId = req.params.projetId
        const idArticleRevenu = req.params.idArticleRevenu

        const projet = await Projet.findByPk(projetId, {
            attributes: ['idProjet'],
            include: [{
                model: Demande, attributes: ['userId'], as: 'demande',
            }]
        })

        if (!projet)
            throw new NotFoundError()

        if (projet.demande.userId !== req.user.idUser)
            throw new NotFoundError()

        const result = await ArticleRevenu.findOne({
            where: {
                projetId, idArticleRevenu
            }
        })

        if (!result)
            throw new NotFoundError('Ce revenu n\'existe pas')

        if (result.etat === statusArticleRevenu.accepted)
            throw new UnauthroizedError()
        await sequelize.transaction(async t => {

            await ArticleRevenu.destroy({
                where: {
                    projetId, idArticleRevenu
                }
            },
                { transaction: t }
            )
        })

        new SuccessResponse(`Revenu supprimé(e) avec succès`).send(res)
    }))


module.exports = router