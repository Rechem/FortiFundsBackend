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
const { isAdmin, isModo, isSimpleUser } = require('../../core/utils')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/complements/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        let fileName = file.originalname.match(RegExp(/^.*(?=\.[a-zA-Z]+)/g))
        fileName = fileName.toString().replace(/ /g, "_");
        cb(null, fileName + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10485760 },
    fileFilter: (req, file, cb) => {
        const fileTypes = /pdf|doc|docx|xls|xlsx|pptx|ppt|zip|rar|jpg|jpeg|png/
        const mimeType = fileTypes.test(file.mimetype)
        const extname = fileTypes.test(path.extname(file.originalname))
        if (mimeType && extname) {
            return cb(null, true)
        } else
            cb(null, false, new BadRequestError(`Format de fichier invalide.`))
    }
}).single('complementFile')

const router = new express.Router()

//currently not in use
router.get('/:idComplement/download/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {

    const idComplement = req.params.idComplement

    const complement = await Complement.findByPk(idComplement)
    if (!complement)
        throw new NotFoundError("Complement introuvable")
    next()
    // res.download(complement.cheminComplement, complement.cheminComplement.match(new RegExp(/[a-zA-Z-/_.0-9]+$/g)));
}))

router.patch('/', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        if (!isSimpleUser(req))
            throw new UnauthroizedError()
        return next()
    }),
    upload,
    asyncHandler(async (req, res, next) => {
        if (!req.file)
            throw new BadRequestError('Format de fichier invalide.')

        const complement = await Complement.findByPk(req.body.idComplement)
        if (!complement)
            throw new NotFoundError()
        //The afterUpdate hook is fired after calling update on an instance
        await complement.update({ cheminComplement: req.file.path })

        new SuccessResponse("Complément ajouté.").send(res)
    }))

module.exports = router