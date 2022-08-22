const express = require('express')
const path = require('path')
const multer = require('multer')
const { Demande, User, Complement, Commission } = require('../../models');
const { jwtVerifyAuth } = require('../../helpers/jwt-verify-auth');
const asyncHandler = require('../../helpers/async-handler')
const { SuccessCreationResponse, SuccessResponse } = require('../../core/api-response')
const { BadRequestError, UnauthroizedError, NotFoundError } = require('../../core/api-error')
const { ValidationError } = require('sequelize')
const { roles, status, flattenObject } = require('../../core/utils')
const { isAdmin, isModo, isSimpleUser } = require('../../core/utils')
const { Op } = require('sequelize')
const _ = require('lodash')
const { sequelize } = require('../../models/index');
const commission = require('../../models/commission');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `./uploads/business-plans/`);
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

//add new demande
router.post('/', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        if (!isSimpleUser(req))
            throw new UnauthroizedError()
        return next()
    }),
    upload,
    asyncHandler(async (req, res, next) => {
        //TODO FIX NAME SUFFIX (DATE)
        try {

            if (!req.file)
                throw new BadRequestError('Format de fichier invalide.')

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
                throw new BadRequestError()
            } else
                throw e
        }

    }))

//get user's demandes
router.get('/user/:idUser', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        const userId = req.params.idUser
        if (isAdmin(req) || isModo(req) ||
            (isSimpleUser(req) && userId == req.user.idUser)) {
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

//get all demandes
router.get('/', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {

        let searchInput = req.query.searchInput || ''

        let condition = {}

        if (isSimpleUser(req)) {
            condition = { userId: req.user.idUser }
        }

        let demandes = await Demande.findAll({
            where: condition,
            include: [{ model: User, attributes: ['idUser', 'nom', 'prenom'], as: 'user' }]
        });

        searchInput = searchInput.trim()
        if (demandes.length > 0 && searchInput !== '') {


            const fields = [
                "denominationCommerciale",
                "nbEmploye",
                "dateCreation",
                "nif",
                "nbLabel",
                "formeJuridique",
                "user.nom",
                "user.prenom",
            ]
            searchInput = searchInput.toLowerCase().trim()
            demandes = demandes.filter(demande => {
                let values = Object.values(_.pick(flattenObject(demande.toJSON()), fields))
                return searchInput.split(' ').every(el => values.some(e => e.toLowerCase().includes(el)))
            })
        }

        new SuccessResponse('Liste des Demandes', { demandes }).send(res)
        // res.status(200).json({ status: "success", demandes })
    }))

// get all demandes with server side pagination
// router.get('/', jwtVerifyAuth,
//     asyncHandler(async (req, res, next) => {
//         // let searchInput = req.query.q || ''
//         const fields = [
//             "denominationCommerciale",
//             "nbEmploye",
//             "dateCreation",
//             "nif",
//             "nbLabel",
//             "formeJuridique"
//         ]

//         const { search, orderBy, sortBy, page, size, } = req.query

//         let condition = null

//         if(isSimpleUser(req)){
//             condition = {userId : req.user.idUser}
//         }

//         if (search) {
//             let query = search ? search.split(' ') : ''
//             query = query.map(function (item) {
//                 return {
//                     [Op.like]: '%' + item + '%'
//                 };
//             });
//             const filters = {}
//             fields.forEach((item) => (filters[item] = {[Op.or]: query}))

//             // const filters = []
//             // fields.forEach((item) => (
//             //     filters.push(sequelize.where(
//             //         sequelize.cast(sequelize.col(
//             //             `Demande.${item}`),"varchar"), {[Op.or]: query}))))

//             condition = {...condition, [Op.or]: filters }

//             console.log(condition);
//         }

//         const { limit, offset } = getPagination(page, size)

//         const orderFilter = orderBy ? sortBy ? [orderBy, sortBy] : [orderBy, 'DESC'] : ['createdAt', 'DESC']

//         const demandes = await Demande.findAndCountAll({
//             where: condition,
//                 limit,
//                 offset,
//                 order: [orderFilter],
//                 // include: [{ model: User, attributes: ['idUser', 'nom', 'prenom'], as: 'user' }]
//             });

//         new SuccessResponse('Liste des Demandes',  
//             getDemandesPagingData(demandes, page, limit)
//             ).send(res)
//         // res.status(200).json({ status: "success", demandes })
//     }))

//download business plan
router.post('/:idDemande/business-plan/', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {

        const idDemande = req.params.idDemande

        const demande = await Demande.findByPk(idDemande)

        if (!demande)
            throw new NotFoundError("Demande introuvable")

        res.download(demande.businessPlan, demande.businessPlan.match(new RegExp(/[a-zA-Z-/_.0-9]+$/g)));
    }))

//get demande by id
router.get('/:idDemande', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        const idDemande = req.params.idDemande

        const demande = await Demande.findByPk(idDemande, {
            attributes: {exclude : ['createdAt', 'updatedAt', 'avatar', 'seenByUser',]},
            include: [
                { model: User, attributes: ['idUser', 'nom', 'prenom', 'avatar'], as: 'user' },
                { model: Complement, attributes: ['idComplement', 'nomComplement', 'cheminComplement'], as: 'complements' },
            ]
        })

        if (!demande)
            throw new NotFoundError("Demande introuvable")

        if (isAdmin(req) || isModo(req) ||
            (isSimpleUser(req) && demande.user.idUser == req.user.idUser))
            new SuccessResponse('Demande', { demande }).send(res)
        else
            throw new UnauthroizedError()
    }))

router.patch('/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {

    if (!isAdmin(req))
        throw new UnauthroizedError()

    //to accept or refuse
    const idDemande = req.body.idDemande
    const nouveauEtat = req.body.etat

    if (!nouveauEtat || !idDemande)
        throw new BadRequestError()

    const demande = await Demande.findByPk(idDemande)
    if (!demande)
        throw new NotFoundError('Cette demande n\'existe pas.')

    switch (nouveauEtat) {
        case status.programmee:

            const idCommission = req.body.idCommission

            if (!idCommission)
                throw new BadRequestError()

            const commission = await Commission.findByPk(idCommission)
            if (!commission)
                throw new NotFoundError('Cette commission n\'existe pas.')
            if (commission.etat === status.terminee)
                throw new BadRequestError('Cette commission s\'est terminée.')

            await sequelize.transaction(async (t) => {

                await demande.update({
                    etat: nouveauEtat,
                    commissionId: idCommission
                }, { transaction: t })

                const message = req.body.message

                if (message) {
                    //TODO SEND MESSAGE
                }

            })
            break;
        case status.refused:

            await sequelize.transaction(async (t) => {

                await demande.update({
                    etat: nouveauEtat,
                }, { transaction: t })

                const message = req.body.message

                if (message) {
                    //TODO SEND MESSAGE
                }
            })

            break;

        case status.preselectionnee:

            await sequelize.transaction(async (t) => {

                await demande.update({
                    etat: nouveauEtat,
                }, { transaction: t })

                const message = req.body.message

                if (message) {
                    //TODO SEND MESSAGE
                }
            })
            break;
        case status.pending:
            await demande.update({
                etat: nouveauEtat,
                commissionId: null,
            })
            break;

        case status.complement:

            const listComplements = req.body.listComplements

            if (!listComplements
                || listComplements.length === 0
                || !listComplements.every(c => c))
                throw new BadRequestError()

            await sequelize.transaction(async (t) => {

                await demande.update({
                    etat: nouveauEtat,
                }, { transaction: t })

                await Complement.bulkCreate(
                    listComplements.map(c => ({
                        nomComplement: c,
                        createdBy: req.user.idUser,
                        demandeId: idDemande,
                    })),
                    { transaction: t }
                )

                const message = req.body.message

                if (message) {
                    //TODO SEND MESSAGE
                }
            })
            break;
        default:
            throw new BadRequestError()
    }

    new SuccessResponse('Demande mise à jour avec succès').send(res)
}))

//download complements
router.post('/:idDemande/complement/', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {

        const idDemande = req.params.idDemande

        const demande = await Demande.findByPk(idDemande)
        if (!demande)
            throw new NotFoundError("Demande introuvable")

        res.download(demande.businessPlan, demande.businessPlan.match(new RegExp(/[a-zA-Z-/_.0-9]+$/g)));
    }))

module.exports = router