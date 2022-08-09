const express = require('express')
const path = require('path')
const multer = require('multer')
const Demande = require('../../models/demande');
const User = require('../../models/user');
const { jwtVerifyAuth } = require('../../helpers/jwt-verify-auth');
const asyncHandler = require('../../helpers/async-handler')
const { SuccessCreationResponse, SuccessResponse } = require('../../core/api-response')
const { BadRequestError, UnauthroizedError, NotFoundError } = require('../../core/api-error')
const { ValidationError } = require('sequelize')
const { roles } = require('../../models/utils')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './business-plans/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        let fileName = file.originalname.match(RegExp(/^[ a-zA-Z-/_.0-9]*(?=\.[a-zA-Z]+)/g))
        fileName = fileName.toString().replace(/ /g, "_");
        cb(null, fileName + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10485760 },
    fileFilter: (req, file, cb) => {
        const fileTypes = /pdf|doc|docx|xls|xlsx|pptx|ppt/
        const mimeType = fileTypes.test(file.mimetype)
        const extname = fileTypes.test(path.extname(file.originalname))
        if (mimeType && extname) {
            return cb(null, true)
        } else
            cb(null, false, new BadRequestError('Format de fichier invalide.'))
    }
}).single('businessPlan')

const router = new express.Router()

router.post('/', jwtVerifyAuth, upload, asyncHandler(async (req, res, next) => {
    //TODO FIX NAME SUFFIX (DATE)
    try {

        if (!req.file)
            throw new BadRequestError('Invalid File Format')

        const demande = {
            nbEmploye: Number(req.body.nbEmploye),
            dateCreation: req.body.dateCreation,
            nif: req.body.nif,
            nbLabel: req.body.nbLabel,
            formeJuridique: req.body.formeJuridique,
            denominationCommerciale: req.body.denominationCommerciale,
            montant: req.body.montant,
            businessPlan: req.file.path,
            userId: req.user.idUser,
        }

        await Demande.create({ ...demande })

        new SuccessCreationResponse('Demande créée avec succès').send(res)

    } catch (e) {
        if (e instanceof ValidationError) {
            throw new BadRequestError(e.errors[0].message)
        } else
            throw e
    }

}))

router.get('/user/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    const userId = req.query.idUser
    if (req.user.role === roles.roleAdmin || req.user.role === roles.roleModerator
        || (req.user.role === roles.roleSimpleUser && userId === req.user.idUser)) {

        let searchInput = req.query.searchInput || ''

        let demandes = await Demande.findAll({
            where: {
                //use req.user from token middleware
                userId,
            }
        });

        if (demandes.length > 0 && searchInput !== '') {
            searchInput = searchInput.trim()
            demandes = demandes.filter(e => {
                return e.denominationCommerciale.includes(searchInput)
                    || e.nbEmploye.toString().includes(searchInput)
                    || e.dateCreation.toString().includes(searchInput)
                    || e.nif.includes(searchInput)
                    || e.nbLabel.includes(searchInput)
                    || e.formeJuridique.includes(searchInput)
            })
        }
        new SuccessResponse('Demandes utilisateur', { demandes }).send(res)
    } else {
        throw new UnauthroizedError()
    }
}))

router.get('/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {

    let searchInput = req.query.searchInput || ''

    let demandes = await Demande.findAll({ include: [{ model: User, attributes: ['idUser', 'nom', 'prenom'], as: 'user' }] });

    if (demandes.length > 0 && searchInput !== '') {
        searchInput = searchInput.trim()
        demandes = demandes.filter(e => {
            return e.denominationCommerciale.includes(searchInput)
                || e.nbEmploye.toString().includes(searchInput)
                || e.dateCreation.toString().includes(searchInput)
                || e.nif.includes(searchInput)
                || e.nbLabel.includes(searchInput)
                || e.formeJuridique.includes(searchInput)
        })
    }

    new SuccessResponse('Liste des Demandes', { demandes }).send(res)
    // res.status(200).json({ status: "success", demandes })
}))

router.post('/:idDemande/business-plan/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {

    const idDemande = req.params.idDemande

    const demande = await Demande.findByPk(idDemande)
    if (!demande)
        throw new NotFoundError("Demande introuvable")

    res.download(demande.businessPlan, demande.businessPlan.match(new RegExp(/[a-zA-Z-/_.0-9]+$/g)));
}))

module.exports = router