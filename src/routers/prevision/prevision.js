const express = require('express')
const { UnauthroizedError, BadRequestError, NotFoundError, InternalError } = require('../../core/api-error')
const { SuccessCreationResponse, SuccessResponse } = require('../../core/api-response')
const asyncHandler = require('../../helpers/async-handler')
const { jwtVerifyAuth } = require('../../helpers/jwt-verify-auth')
const { isAdmin, isModo, sanitizeFileName, isSimpleUser, statusPrevision, upload, fieldNames, statusRealisation } = require('../../core/utils')
const { Prevision, Projet, Tranche, TypeInvestissement, TypePoste,
    Investissement, Demande, Salaire, TypeChargeExterne, ChargeExterne, Realisation } = require('../../models')
const db = require('../../models');
const { investissementChargeSchema, salaireSchema, previsionPatchSchema } = require('./schema')
const _ = require('lodash')
const { getValeur, verifyOwnerShip } = require('../../helpers/prevision-realisation')

const router = new express.Router()

router.get('/:projetId/:numeroTranche', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        const projetId = req.params.projetId
        const numeroTranche = req.params.numeroTranche

        await verifyOwnerShip(req, projetId)

        const prevision = await Prevision.findOne({
            where: { projetId, numeroTranche },
            attributes: { exclude: ['projetId', 'createdAt', 'updatedAt'], },
            include: [{
                model: Projet, attributes: ['idProjet', 'montant'], as: 'projet',
                include: [
                    { model: Tranche, attributes: ['nbTranches', 'pourcentage'], as: 'tranche' },
                    { model: Demande, attributes: ['denominationCommerciale'], as: 'demande' },
                    { model: Prevision, attributes: ['numeroTranche'], as: 'previsions' },
                ]
            }]
        })

        if (!prevision)
            throw new NotFoundError()

        const valeurPrevision = await getValeur(projetId, numeroTranche)

        const maxTranche = prevision.projet.previsions.length === 0 ? 0 : Math.max(...prevision.projet.previsions.map(p => p.numeroTranche))


        new SuccessResponse('List des previsions',
            { prevision: { ..._.omit(prevision.toJSON(), ['projet.previsions']), maxTranche, valeurPrevision } }).send(res)
    }))

router.get('/typesinvestissements', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    const typesInvestissement = await TypeInvestissement.findAll()

    new SuccessResponse('List des types d\'investissements', { types: typesInvestissement }).send(res)
}))

router.get('/typespostes', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    const typesPostes = await TypePoste.findAll()

    new SuccessResponse('List des postes', { types: typesPostes }).send(res)
}))

router.get('/typeschargesexternes', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    const typesChargesExternes = await TypeChargeExterne.findAll()

    new SuccessResponse('List des postes', { types: typesChargesExternes }).send(res)
}))

router.get('/:projetId/:numeroTranche/:typePrevision', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        const projetId = req.params.projetId
        const numeroTranche = req.params.numeroTranche
        const typePrevision = req.params.typePrevision

        await verifyOwnerShip(req, projetId)

        let modelName, typeName, attributes;

        switch (typePrevision) {
            case 'investissements':
                modelName = 'Investissement'
                typeName = 'TypeInvestissement';
                break;
            case 'salaires':
                modelName = 'Salaire';
                typeName = 'TypePoste';
                break;
            case 'chargesexternes':
                modelName = 'ChargeExterne';
                typeName = 'TypeChargeExterne';
                break;

            default:
                throw new BadRequestError('Nom de ressource incorrect')
        }
        const results = await db[modelName].findAll({
            where: { projetId, numeroTranche },
            include: [
                { model: db[typeName], as: 'type' }
            ]
        })

        new SuccessResponse(`List des ${modelName}`, { results }).send(res)
    }))

router.patch('/salaires', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        if (!isSimpleUser(req))
            throw new UnauthroizedError()

        const { error } = salaireSchema.validate(req.body)
        if (error)
            throw new BadRequestError(error.details[0].message)

        if (!req.body.idSalaire)
            throw new BadRequestError('Id requise')

        const projet = await Projet.findByPk(req.body.projetId, {
            attributes: ['idProjet'],
            include: [{
                model: Demande, attributes: ['userId'], as: 'demande',
            },
            {
                model: Prevision, attributes: ['etat'], as: 'previsions',
                where: {
                    numeroTranche: req.body.numeroTranche
                }
            }]
        })

        if (!projet)
            throw new NotFoundError()

        if (projet.demande.userId !== req.user.idUser)
            throw new NotFoundError()

        if (projet.previsions[0].etat !== statusPrevision.brouillon &&
            projet.previsions[0].etat !== statusPrevision.refused)
            throw new UnauthroizedError()

        const result = await Salaire.findOne({
            where: {
                projetId: req.body.projetId,
                numeroTranche: req.body.numeroTranche,
                idSalaire: req.body.idSalaire
            }
        })

        if (!result)
            throw new NotFoundError('Cet article n\'existe pas')

        delete req.body.idSalaire

        await result.update(req.body)

        new SuccessResponse(`Salaire mis à jour avec succès`).send(res)

    }))

router.patch('/investissementsChargesExternes', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        if (!isSimpleUser(req))
            throw new UnauthroizedError()
        next()
    }),
    upload.single(fieldNames.factureArticlePrevision),
    asyncHandler(async (req, res, next) => {
        const { error } = investissementChargeSchema.validate(req.body)
        if (error)
            throw new BadRequestError(error.details[0].message)

        if (!req.body.id)
            throw new BadRequestError('Id requise')

        const projet = await Projet.findByPk(req.body.projetId, {
            attributes: ['idProjet'],
            include: [{
                model: Demande, attributes: ['userId'], as: 'demande',
            },
            {
                model: Prevision, attributes: ['etat'], as: 'previsions',
                where: {
                    numeroTranche: req.body.numeroTranche
                }
            }]
        })
        if (!projet)
            throw new NotFoundError()

        if (projet.demande.userId !== req.user.idUser)
            throw new NotFoundError()

        if (projet.previsions[0].etat !== statusPrevision.brouillon &&
            projet.previsions[0].etat !== statusPrevision.refused)
            throw new UnauthroizedError()

        let modelName, responseName, idName, idTypeName;
        if (req.body.investissementOuCharge === 'investissement') {
            idName = 'idInvestissement'
            idTypeName = 'typeInvestissementId'
            modelName = 'Investissement'
            responseName = 'Investissement'
        } else if (req.body.investissementOuCharge === 'charge-externe') {
            idName = 'idChargeExterne'
            idTypeName = 'typeChargeExterneId'
            modelName = 'ChargeExterne'
            responseName = 'Charge externe'
        }

        const result = await db[modelName].findOne({
            where: {
                projetId: req.body.projetId,
                numeroTranche: req.body.numeroTranche,
                [idName]: req.body.id
            }
        })

        if (!result)
            throw new NotFoundError('Cet article n\'existe pas')

        let body = {
            [idTypeName]: req.body.idType,
            description: req.body.description,
            montantUnitaire: req.body.montantUnitaire,
            quantite: req.body.quantite,
        }

        if (req.body.lienOuFacture === 'lien') {
            if (!req.body.lien)
                throw BadRequestError('Lien non fourni')
            body.lien = req.body.lien
            if (result.facture) {
                fileNameToDelete = result.facture.replace(/^\\uploads/g, 'public')
                deleteFile(fileNameToDelete)
                body.facture = null
            }
        } else if (req.body.lienOuFacture === 'facture') {
            body.lien = null
            if (req.file) {
                body.facture = sanitizeFileName(req.file.path)
                if (result.facture) {
                    fileNameToDelete = result.facture.replace(/^\\uploads/g, 'public')
                    deleteFile(fileNameToDelete)
                }
            } else {
                if (!result.facture)
                    throw BadRequestError('Facture non fournie')
            }
        }

        await result.update(body)

        new SuccessResponse(`${responseName} mis(e) à jour avec succès`).send(res)

    }))

router.delete('/:projetId/:numeroTranche/:typePrevision/:id',
    jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        if (!isSimpleUser(req))
            throw new UnauthroizedError()

        const projetId = req.params.projetId
        const numeroTranche = req.params.numeroTranche
        const typePrevision = req.params.typePrevision
        const id = req.params.id

        const projet = await Projet.findByPk(projetId, {
            attributes: ['idProjet'],
            include: [{
                model: Demande, attributes: ['userId'], as: 'demande',
            },
            {
                model: Prevision, attributes: ['etat'], as: 'previsions',
                where: {
                    numeroTranche
                }
            }]
        })
        if (!projet)
            throw new NotFoundError()

        if (projet.demande.userId !== req.user.idUser)
            throw new NotFoundError()

        if (projet.previsions[0].etat !== statusPrevision.brouillon &&
            projet.previsions[0].etat !== statusPrevision.refused)
            throw new UnauthroizedError()

        let modelName, responseName, idName;
        if (typePrevision === 'investissement') {
            idName = 'idInvestissement'
            modelName = 'Investissement'
            responseName = modelName
        } else if (typePrevision === 'charge-externe') {
            idName = 'idChargeExterne'
            modelName = 'ChargeExterne'
            responseName = 'Charge externe'
        } else {
            idName = 'idSalaire'
            modelName = 'Salaire'
            responseName = modelName
        }

        const result = await db[modelName].findOne({
            where: {
                projetId,
                numeroTranche,
                [idName]: id
            }
        })

        if (!result)
            throw new NotFoundError('Cet article n\'existe pas')

        await db[modelName].destroy({
            where: {
                projetId,
                numeroTranche,
                [idName]: id
            }
        })

        new SuccessResponse(`${responseName} supprimé(e) avec succès`).send(res)
    }))

router.post('/investissementsChargesExternes', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        if (!isSimpleUser(req))
            throw new UnauthroizedError()
        next()
    }),
    upload.single(fieldNames.factureArticlePrevision),
    asyncHandler(async (req, res, next) => {
        const { error } = investissementChargeSchema.validate(req.body)
        if (error)
            throw new BadRequestError(error.details[0].message)

        const projet = await Projet.findByPk(req.body.projetId, {
            attributes: ['idProjet'],
            include: [{
                model: Demande, attributes: ['userId'], as: 'demande',
            },
            {
                model: Prevision, attributes: ['etat'], as: 'previsions',
                where: {
                    numeroTranche: req.body.numeroTranche
                }
            }]
        })
        if (!projet)
            throw new NotFoundError()

        if (projet.demande.userId !== req.user.idUser)
            throw new NotFoundError()

        if (projet.previsions[0].etat !== statusPrevision.brouillon &&
            projet.previsions[0].etat !== statusPrevision.refused)
            throw new UnauthroizedError()

        let body = {
            projetId: req.body.projetId,
            numeroTranche: req.body.numeroTranche,
            description: req.body.description,
            montantUnitaire: req.body.montantUnitaire,
            quantite: req.body.quantite,
        }

        if (req.body.lienOuFacture === 'lien') {
            if (!req.body.lien)
                throw BadRequestError('Lien non fourni')
            body.lien = req.body.lien
        } else if (req.body.lienOuFacture === 'facture') {
            if (req.file)
                body.facture = sanitizeFileName(req.file.path)
            else
                throw new BadRequestError('Facture non fourni')
        }

        let modelName, responseName;
        if (req.body.investissementOuCharge === 'investissement') {
            body.typeInvestissementId = req.body.idType
            modelName = 'Investissement'
            responseName = 'Investissement'
        } else {
            body.typeChargeExterneId = req.body.idType
            modelName = 'ChargeExterne'
            responseName = 'Charge externe'
        }

        await db[modelName].create(body)

        return new SuccessCreationResponse(`${responseName} ajouté(e) avec succès`).send(res)

    }))

router.post('/salaires', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        if (!isSimpleUser(req))
            throw new UnauthroizedError()

        const { error } = salaireSchema.validate(req.body)
        if (error)
            throw new BadRequestError(error.details[0].message)

        const projet = await Projet.findByPk(req.body.projetId, {
            attributes: ['idProjet'],
            include: [{
                model: Demande, attributes: ['userId'], as: 'demande'
            }, {
                model: Prevision, attributes: ['etat'], as: 'previsions', where: {
                    numeroTranche: req.body.numeroTranche
                }
            }]
        })

        if (!projet)
            throw new NotFoundError()

        if (projet.demande.userId !== req.user.idUser)
            throw new NotFoundError()

        if (projet.previsions[0].etat !== statusPrevision.brouillon &&
            projet.previsions[0].etat !== statusPrevision.refused)
            throw new UnauthroizedError()

        if (req.body.idSalaire)
            delete req.body.idSalaire

        await Salaire.create(req.body)

        new SuccessCreationResponse('Salaire ajouté avec succes').send(res)

    }),
)

//create new prevision
router.post('/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    if (!isAdmin(req))
        throw new UnauthroizedError()

    const projetId = req.body.projetId
    if (!projetId)
        throw new BadRequestError('idProjet requise')

    const projet = await Projet.findByPk(projetId, {
        attributes: ['idProjet'],
        include: [
            { model: Tranche, attributes: ['nbTranches'], as: 'tranche' },
            { model: Prevision, attributes: ['numeroTranche', 'etat'], as: 'previsions' },
            { model: Realisation, attributes: ['numeroTranche', 'etat'], as: 'realisations' },]
    })

    if (!projet)
        throw NotFoundError("Ce projet n'existe pas")

    if (!projet.tranche)
        throw new BadRequestError("Tranches non assignées au projet")

    const maxTranchePrevision = projet.previsions.length === 0 ? 0 : Math.max(...projet.previsions.map(p => p.numeroTranche))

    if (projet.tranche.nbTranches <= maxTranchePrevision)
        throw new BadRequestError("Le numéro de tranche ne peut pas excéder le nombre total de tranches")

    const maxTrancheRealisation = projet.realisations.length === 0 ? 0 : Math.max(...projet.realisations.map(r => r.numeroTranche))
    if (!(maxTranchePrevision === 0 ||
        (maxTrancheRealisation === maxTranchePrevision &&
            projet.previsions.every(p => p.etat === statusPrevision.accepted) && projet.realisations.length > 0
            && projet.realisations.every(r => r.etat === statusRealisation.terminee))))
        throw new BadRequestError('Il existe des réalisation non terminées')

    const previsionBody = {
        numeroTranche: maxTranchePrevision + 1,
        projetId: req.body.projetId,
        etat: statusPrevision.brouillon,
    }

    await Prevision.create(previsionBody)

    new SuccessCreationResponse('Prévision créée avec succès').send(res)
}))

router.patch('/:projetId/:numeroTranche', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        const projetId = Number(req.params.projetId)
        const numeroTranche = Number(req.params.numeroTranche)

        const { error } = previsionPatchSchema.validate(req.body)
        if (error)
            throw new BadRequestError(error.details[0].message)

        const prevision = await Prevision.findOne({
            where: { projetId, numeroTranche },
            attributes: { exclude: ['createdAt', 'updatedAt'], },
            include: [{
                model: Projet, attributes: ['idProjet', 'montant'], as: 'projet',
                include: [
                    { model: Tranche, attributes: ['nbTranches', 'pourcentage'], as: 'tranche' },
                    { model: Demande, attributes: ['denominationCommerciale'], as: 'demande' },
                ]
            }]
        })

        if (!prevision)
            throw new NotFoundError()

        const newEtat = req.body.etat;

        switch (newEtat) {
            case statusPrevision.pending:
                if (!isSimpleUser(req))
                    throw new UnauthroizedError()

                const valeurPrevision = await getValeur(projetId, numeroTranche)
                const valeurTranche = prevision.projet.tranche.pourcentage[prevision.numeroTranche]
                    * prevision.projet.montant;

                if (valeurPrevision === 0)
                throw new BadRequestError(`Vous n'avez inséré aucun article`)
                
                if (valeurPrevision > valeurTranche)
                throw new BadRequestError(`Le montant total de la prévision dépasse le montant de ${valeurTranche}`)

                prevision.etat = newEtat
                
                await prevision.save()
                break;
            case statusPrevision.accepted:
            case statusPrevision.refused:
                if (!isAdmin(req) || prevision.etat !== statusPrevision.pending)
                    throw new UnauthroizedError();

                await prevision.update({ etat: newEtat })

                // if (prevision.etat === statusPrevision.refused && req.body.message){
                // TODO WITH TRANSACTION
                // }

                break;
            default:
                throw new InternalError()
        }

        new SuccessResponse('Succès').send(res)
    }))

module.exports = router