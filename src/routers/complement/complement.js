const express = require('express')
const path = require('path')
const multer = require('multer')
const {Demande, User, Complement} = require('../../models');
const { jwtVerifyAuth } = require('../../helpers/jwt-verify-auth');
const asyncHandler = require('../../helpers/async-handler')
const { SuccessCreationResponse, SuccessResponse } = require('../../core/api-response')
const { BadRequestError, UnauthroizedError, NotFoundError } = require('../../core/api-error')
const { ValidationError, where } = require('sequelize')
const { roles } = require('../../core/utils')
const { isAdmin, isModo, isSimpleUser, fieldNames, upload, sanitizeFileName } = require('../../core/utils')

const router = new express.Router()

//currently not in use
// router.get('/:idComplement/download/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {

//     const idComplement = req.params.idComplement

//     const complement = await Complement.findByPk(idComplement)
//     if (!complement)
//         throw new NotFoundError("Complement introuvable")
//     next()
//     // res.download(complement.cheminComplement, complement.cheminComplement.match(new RegExp(/[a-zA-Z-/_.0-9]+$/g)));
// }))

router.patch('/', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        if (!isSimpleUser(req))
            throw new UnauthroizedError()
        return next()
    }),
    upload.single(fieldNames.complementFile),
    asyncHandler(async (req, res, next) => {
        if (!req.file)
            throw new BadRequestError('Format de fichier invalide.')

        const complement = await Complement.findByPk(req.body.idComplement)
        if (!complement)
            throw new NotFoundError()
        //The afterUpdate hook is fired after calling update on an instance
        await complement.update({ cheminComplement: sanitizeFileName(req.file.path) })

        new SuccessResponse("Complément ajouté.").send(res)
    }))

module.exports = router