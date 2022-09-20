const express = require('express')
const { UnauthroizedError, BadRequestError, NotFoundError } = require('../../core/api-error')
const { SuccessCreationResponse, SuccessResponse } = require('../../core/api-response')
const asyncHandler = require('../../helpers/async-handler')
const { jwtVerifyAuth } = require('../../helpers/jwt-verify-auth')
const { MotifDemande, MotifPrevision, MotifRealisation, MotifRevenu } = require('../../models')
const { roles } = require('../../core/utils')
const { ValidationError } = require('sequelize')
const sequelize = require('../../database/connection')
const { isAdmin, isModo, isSimpleUser } = require('../../core/utils')

const router = new express.Router()

router.get('/demande/:idDemande', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        const idDemande = req.params.idDemande

        const motifsDemande = await MotifDemande.findAll({
            where: { demandeId: idDemande }
        })

        new SuccessResponse('Motifs', { motifsDemande }).send(res)
    }))

router.patch('/demande/:idDemande', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        const idDemande = req.params.idDemande

        if (isSimpleUser(req))
            await MotifDemande.update({
                seenByUser: true,
            },
                {
                    where: { demandeId: idDemande, seenByUser: false, }
                }
            )

        new SuccessResponse('Succès').send(res)
    }))

router.get('/prevision/:projetId/:numeroTranche', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        const projetId = req.params.projetId
        const numeroTranche = req.params.numeroTranche

        const motifsPrevision = await MotifPrevision.findAll({
            where: { projetId, numeroTranche }
        })

        new SuccessResponse('Motifs', { motifsPrevision }).send(res)
    }))

router.patch('/prevision/:projetId/:numeroTranche', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        const projetId = req.params.projetId
        const numeroTranche = req.params.numeroTranche

        if (isSimpleUser(req))
            await MotifPrevision.update({
                seenByUser: true,
            },
                {
                    where: { projetId, numeroTranche, seenByUser: false, }
                }
            )

        new SuccessResponse('Succès').send(res)
    }))

router.get('/realisation/:projetId/:numeroTranche/:type/:idArticle', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        const projetId = req.params.projetId
        const numeroTranche = req.params.numeroTranche
        const type = req.params.type
        const idArticle = req.params.idArticle

        const motifsRealisation = await MotifRealisation.findAll({
            where: { projetId, numeroTranche, type, idArticle }
        })

        new SuccessResponse('Motifs', { motifsRealisation }).send(res)
    }))

router.patch('/realisation/:projetId/:numeroTranche/:type/:idArticle', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        const projetId = req.params.projetId
        const numeroTranche = req.params.numeroTranche
        const type = req.params.type
        const idArticle = req.params.idArticle

        if (isSimpleUser(req))
            await MotifRealisation.update({
                seenByUser: true,
            },
                {
                    where: { projetId, numeroTranche, type, idArticle, seenByUser: false, }
                }
            )

        new SuccessResponse('Succès').send(res)
    }))

    
router.get('/revenu/:projetId/:idArticleRevenu', jwtVerifyAuth,
asyncHandler(async (req, res, next) => {
    const projetId = req.params.projetId
    const idArticleRevenu = req.params.idArticleRevenu

    const motifsRevenu = await MotifRevenu.findAll({
        where: { projetId, idArticleRevenu }
    })

    new SuccessResponse('Motifs', { motifsRevenu }).send(res)
}))

router.patch('/revenu/:projetId/:idArticleRevenu', jwtVerifyAuth,
asyncHandler(async (req, res, next) => {
    const projetId = req.params.projetId
    const idArticleRevenu = req.params.idArticleRevenu

    if (isSimpleUser(req))
        await MotifRevenu.update({
            seenByUser: true,
        },
            {
                where: { projetId, idArticleRevenu, seenByUser: false, }
            }
        )

    new SuccessResponse('Succès').send(res)
}))

module.exports = router