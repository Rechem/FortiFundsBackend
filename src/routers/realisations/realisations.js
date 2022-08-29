const express = require('express')
const { UnauthroizedError, BadRequestError, NotFoundError, InternalError } = require('../../core/api-error')
const { SuccessCreationResponse, SuccessResponse } = require('../../core/api-response')
const asyncHandler = require('../../helpers/async-handler')
const { jwtVerifyAuth } = require('../../helpers/jwt-verify-auth')
const { isAdmin, isModo, isSimpleUser, statusRealisation, upload, fieldNames, statusPrevision } = require('../../core/utils')
const { Realisation, Prevision, Projet, Tranche, TypeInvestissement, TypePoste,
    Investissement, Demande, Salaire, TypeChargeExterne, ChargeExterne, ArticleRealisation } = require('../../models')
const db = require('../../models');
const { getValeur, verifyOwnerShip } = require('../../helpers/prevision-realisation')
const sequelize = require('../../database/connection')
const _ = require('lodash')

const router = new express.Router()

router.get('/:projetId/:numeroTranche', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        const projetId = req.params.projetId
        const numeroTranche = req.params.numeroTranche

        await verifyOwnerShip(req, projetId)

        const realisation = await Realisation.findOne({
            where: { projetId, numeroTranche },
            attributes: { exclude: ['projetId', 'createdAt', 'updatedAt'], },
            include: [{
                model: Projet, attributes: ['idProjet', 'montant'], as: 'projet',
                include: [
                    { model: Tranche, attributes: ['nbTranches', 'pourcentage'], as: 'tranche' },
                    { model: Demande, attributes: ['denominationCommerciale'], as: 'demande' },
                    { model: Realisation, attributes: ['numeroTranche'], as: 'realisations' },
                ]
            }]
        })

        if (!realisation)
            throw new NotFoundError()

        const valeurRealisation = await getValeur(projetId, numeroTranche)

        // const result = await Realisation.findOne({
        //     where: { projetId, numeroTranche },
        //     attributes: [[sequelize.fn('MAX', sequelize.col('realisation.numeroTranche')), 'maxTranche']],
        //     where: { projetId }
        // })

        const maxTranche = realisation.projet.realisations.length === 0 ? 0 : Math.max(...realisation.projet.realisations.map(r => r.numeroTranche))

        new SuccessResponse('List des previsions',
            { realisation: { ..._.omit(realisation.toJSON(), ['projet.realisations']), maxTranche, valeurRealisation } }).send(res)
    }))

router.post('/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    if (!isAdmin(req))
        throw new UnauthroizedError()

    const projetId = req.body.projetId
    if (!projetId)
        throw new BadRequestError('idProjet requise')

    const projet = await Projet.findByPk(projetId, {
        include: [
            { model: Tranche, attributes: ['nbTranches'], as: 'tranche' },
            { model: Prevision, attributes: ['numeroTranche', 'etat'], as: 'previsions' },
            { model: Realisation, attributes: ['numeroTranche', 'etat'], as: 'realisations' },
        ]
    })

    if (!projet)
        throw NotFoundError("Ce projet n'existe pas")

    if (!projet.tranche)
        throw new BadRequestError("Tranches non assignées au projet")

    const maxTranchePrevision = projet.previsions.length === 0 ? 0 : Math.max(...projet.previsions.map(p => p.numeroTranche))
    const maxTrancheRealisation = projet.realisations.length === 0 ? 0 : Math.max(...projet.realisations.map(r => r.numeroTranche))

    if (!(projet.previsions.length > 0 &&
        projet.previsions.every(p => p.etat === statusPrevision.accepted)
        && maxTranchePrevision === maxTrancheRealisation + 1))
        throw new BadRequestError('Il existe des prévisions non évaluées')

    const realisationBody = {
        numeroTranche: maxTrancheRealisation + 1,
        projetId,
        etat: statusRealisation.waiting,
    }


    await sequelize.transaction(async (t) => {
        await Realisation.create(realisationBody, { transaction: t })

        const investissements = await Investissement.findAll({
            where: { projetId, numeroTranche: realisationBody.numeroTranche }
        }, { transaction: t })

        await ArticleRealisation.bulkCreate(
            investissements.map((i) => {
                return {
                    idArticle: i.idInvestissement,
                    type: 'Investissement',
                    projetId,
                    numeroTranche: realisationBody.numeroTranche,
                }
            }, { transaction: t })
        )

        const salaires = await Salaire.findAll({
            where: { projetId: realisationBody.projetId, numeroTranche: realisationBody.numeroTranche }
        }, { transaction: t })

        await ArticleRealisation.bulkCreate(
            salaires.map((i) => {
                return {
                    idArticle: i.idSalaire,
                    type: 'Salaire',
                    projetId,
                    numeroTranche: realisationBody.numeroTranche,
                }
            }, { transaction: t })
        )

        const chargesExternes = await ChargeExterne.findAll({
            where: { projetId: realisationBody.projetId, numeroTranche: realisationBody.numeroTranche }
        }, { transaction: t })

        await ArticleRealisation.bulkCreate(
            chargesExternes.map((i) => {
                return {
                    idArticle: i.idChargeExterne,
                    type: 'ChargeExterne',
                    projetId: projetId,
                    numeroTranche: realisationBody.numeroTranche,
                }
            }, { transaction: t })
        )
    })

    new SuccessCreationResponse('Realisation créée avec succès').send(res)

}))

router.get('/:projetId/:numeroTranche/:typePrevision', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        const projetId = req.params.projetId
        const numeroTranche = req.params.numeroTranche
        const typePrevision = req.params.typePrevision

        await verifyOwnerShip(req, projetId)

        let modelName, typeName, attributes, exclude = ['updatedAt', 'numeroTranche', 'projetId',];

        switch (typePrevision) {
            case 'investissements':
                modelName = 'Investissement'
                typeName = 'TypeInvestissement';
                attributes = ['nomType'];
                exclude = exclude.concat(['idInvestissement', 'typeInvestissementId'])
                break;
            case 'salaires':
                modelName = 'Salaire';
                typeName = 'TypePoste';
                attributes = ['nomPoste'];
                exclude = exclude.concat(['idSalaire', 'typePosteId'])
                break;
            case 'chargesexternes':
                modelName = 'ChargeExterne';
                typeName = 'TypeChargeExterne';
                attributes = ['nomType'];
                exclude = exclude.concat(['idChargeExterne', 'typeChargeExterneId'])
                break;

            default:
                throw new BadRequestError('Nom de ressource incorrect')
        }
        const results = await ArticleRealisation.findAll({
            where: { projetId, numeroTranche, type: modelName },
            attributes: { exclude: ['projetId', 'numeroTranche'] },
            include: [
                {
                    model: db[modelName], attributes: { exclude },
                    include: [{ model: db[typeName], attributes, as: 'type' }]
                }
            ]
        })

        new SuccessResponse(`List des ${modelName}`, { results }).send(res)
    }))

module.exports = router