const express = require('express')
const path = require('path')
const multer = require('multer')
const { Demande, User, Complement, Commission, MotifDemande } = require('../../models');
const { jwtVerifyAuth } = require('../../helpers/jwt-verify-auth');
const asyncHandler = require('../../helpers/async-handler')
const { SuccessCreationResponse, SuccessResponse } = require('../../core/api-response')
const { BadRequestError, UnauthroizedError, NotFoundError } = require('../../core/api-error')
const { ValidationError } = require('sequelize')
const { roles, statusDemande, flattenObject, sanitizeFileName, getPagination, getPagingData } = require('../../core/utils')
const { isAdmin, isModo, isSimpleUser, fieldNames, upload } = require('../../core/utils')
const { Op } = require('sequelize')
const _ = require('lodash')
const { sequelize } = require('../../models/index');
const commission = require('../../models/commission');

const router = new express.Router()

const findDemandesAndCountAll = async (
    { idUser, search, orderBy, sortBy, limit, offset, etat }
) => {
    rows = await sequelize.query(
        'CALL search_demandes (:idUser, :search,:limit, :offset, :sortBy, :orderBy, :etat)',
        { replacements: { idUser, search, limit, offset, sortBy, orderBy, etat } })
    count = await sequelize.query('CALL search_demandes_count (:idUser, :search, :etat)',
        { replacements: { idUser, search, etat } })

    return { rows, count: count[0].count }

}

//get all demandes
router.get('/', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {

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
            idUser,
            search: req.query.search || null,
            limit,
            offset,
            orderBy: req.query.orderBy || null,
            sortBy: req.query.sortBy || null,
            etat: req.query.etat || null,
        }

        const response = await findDemandesAndCountAll(reqArgs)

        return new SuccessResponse('Liste des Demandes',
            getPagingData(response, req.query.page)
        ).send(res)
    }))

router.get('/:idDemande', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        const idDemande = req.params.idDemande

        const demande = await Demande.findByPk(idDemande, {
            attributes: { exclude: ['createdAt', 'updatedAt', 'avatar', 'seenByUser',] },
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
            throw new NotFoundError()
    }))

//add new demande
router.post('/', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        if (!isSimpleUser(req))
            throw new UnauthroizedError()
        return next()
    }),
    upload.single(fieldNames.businessPlan),
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
                businessPlan: sanitizeFileName(req.file.path),
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

// get all demandes with server side pagination
// router.get('/', jwtVerifyAuth,
//     asyncHandler(async (req, res, next) => {
//         // let searchInput = req.query.q || ''

//         const { search, orderBy, sortBy, page, size, } = req.query

//         // let condition = null
//         let condition = null

//         if (isSimpleUser(req)) {
//             condition = { userId: req.user.idUser }
//         }

//         if (search) {
//             condition = {
//                 ...condition,
//                 [Op.or]: [
//                     sequelize.where(
//                         sequelize.fn('LOWER', sequelize.col('denominationCommerciale')),
//                         { [Op.like]: `%${search}%` }),
//                     sequelize.where(
//                         sequelize.fn('LOWER', sequelize.col('nbEmploye')),
//                         { [Op.like]: `%${search}%` }),
//                     sequelize.where(
//                         sequelize.fn('LOWER', sequelize.col('nif')),
//                         { [Op.like]: `%${search}%` }),
//                     sequelize.where(
//                         sequelize.fn('LOWER', sequelize.col('nbLabel')),
//                         { [Op.like]: `%${search}%` }),
//                     sequelize.where(
//                         sequelize.fn('LOWER', sequelize.col('formeJuridique')),
//                         { [Op.like]: `%${search}%` }),
//                 ]
//             }
//         }

//         const { limit, offset } = getPagination(page, size)

//         const orderFilter = orderBy ? sortBy ? [orderBy, sortBy] : [orderBy, 'DESC'] : ['createdAt', 'DESC']

//         const demandes = await Demande.findAndCountAll({
//             where: condition,
//             limit,
//             offset,
//             order: [orderFilter],
//         });

//         new SuccessResponse('Liste des Demandes',
//             getPagingData(demandes, page, limit)
//         ).send(res)
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

    if (demande.etat === statusDemande.accepted)
        throw new UnauthroizedError('Cette demande a déjà été acceptée')

    switch (nouveauEtat) {
        case statusDemande.programmee:

            const idCommission = req.body.idCommission

            if (!idCommission)
                throw new BadRequestError()

            const commission = await Commission.findByPk(idCommission)
            if (!commission)
                throw new NotFoundError('Cette commission n\'existe pas.')
            if (commission.etat === statusDemande.terminee)
                throw new BadRequestError('Cette commission s\'est terminée.')

            await sequelize.transaction(async (t) => {

                await demande.update({
                    etat: nouveauEtat,
                    commissionId: idCommission
                }, { transaction: t })
            })
            break;
        case statusDemande.refused:

            const message = req.body.message

            if (!message)
                throw new BadRequestError('Vous devez spécifier le motif de refus')

            await sequelize.transaction(async (t) => {

                await demande.update({
                    etat: nouveauEtat,
                }, { transaction: t })

                await MotifDemande.create({
                    contenuMotif: message,
                    demandeId: demande.idDemande,
                    dateMotif: Date.now(),
                }, { transaction: t })
            })

            break;

        case statusDemande.preselectionnee:

            await sequelize.transaction(async (t) => {

                await demande.update({
                    etat: nouveauEtat,
                }, { transaction: t })
            })
            break;
        case statusDemande.pending:
            await demande.update({
                etat: nouveauEtat,
                commissionId: null,
            })
            break;

        case statusDemande.complement:

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
                    await MotifDemande.create({
                        contenuMotif: message,
                        demandeId: demande.idDemande,
                        dateMotif: Date.now(),
                    }, { transaction: t })
                }
            })
            break;
        default:
            throw new BadRequestError()
    }

    new SuccessResponse('Demande mise à jour avec succès').send(res)
}))

module.exports = router