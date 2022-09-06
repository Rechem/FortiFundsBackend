const asyncHandler = require('./async-handler')
const { isAdmin, isModo, fieldNames } = require('../core/utils')
const { Demande, Complement, Projet, Investissement, ChargeExterne,
    ArticleRealisation, Revenu } = require('../models')
const { NotFoundError } = require('../core/api-error')

const verifyPermission = asyncHandler(async (req, res, next) => {
    if (isAdmin(req) || isModo(req))
        return next()
    const ressourceType = req.url.match(new RegExp(/(?<=\/uploads\/).*(?=\/)/g))[0]
    const ressourceName = `${req.url}`.replace(/\//g, '\\')
    switch (ressourceType) {
        case fieldNames.businessPlan:
            const demande = await Demande.findOne({
                attributes: ['userId'],
                where: { businessPlan: ressourceName }
            })
            if (demande && demande.userId === req.user.idUser)
                return next()
            else
                throw new NotFoundError()
            break;

        case fieldNames.complementFile:
            const complement = await Complement.findOne({
                attributes: [],
                include: [{ model: Demande, attributes: ['userId'], as: 'demande' }],
                where: { cheminComplement: ressourceName }
            })
            if (complement && complement.demande.userId === req.user.idUser)
                next()
            else
                throw new NotFoundError()
            break;
        case fieldNames.rapportCommission:
            throw new NotFoundError()
            break;
        case fieldNames.documentAccordFinancement:
            let projet = await Projet.findOne({
                attributes: [],
                include: [{ model: Demande, attributes: ['userId'], as: 'demande' }],
                where: { documentAccordFinancement: ressourceName }
            })
            if (projet && projet.demande.userId === req.user.idUser)
                next()
            else
                throw new NotFoundError()
            break;
        case fieldNames.factureArticlePrevision:
            const investissement = await Investissement.findOne({
                attributes: [],
                where: { facture: ressourceName },
                include: [{
                    model: Projet, attributes: ['idProjet'], as: 'projet',
                    include: [{ model: Demande, attributes: ['userId'], as: 'demande' }]
                }]
            })

            const chargeExterne = await ChargeExterne.findOne({
                attributes: [],
                where: { facture: ressourceName },
                include: [{
                    model: Projet, attributes: ['idProjet'], as: 'projet',
                    include: [{ model: Demande, attributes: ['userId'], as: 'demande' }]
                }]
            })
            if ((investissement && investissement.projet.demande.userId === req.user.idUser)
                || (chargeExterne && chargeExterne.projet.demande.userId === req.user.idUser))
                next()
            else
                throw new NotFoundError()
            break;
        case fieldNames.factureArticleRealisation:
            const article = await ArticleRealisation.findOne({
                attributes: [],
                where: { facture: ressourceName },
                include: [{
                    model: Projet, attributes: ['idProjet'], as: 'projet',
                    include: [{ model: Demande, attributes: ['userId'], as: 'demande' }]
                }]
            })

            if (article && article.projet.demande.userId === req.user.idUser)
                next()
            else
                throw new NotFoundError()
            break;
        case fieldNames.factureArticleRevenu:
            const revenu = await Revenu.findOne({
                attributes: [],
                where: { facture: ressourceName },
                include: [{
                    model: Projet, attributes: ['idProjet'], as: 'projet',
                    include: [{ model: Demande, attributes: ['userId'], as: 'demande' }]
                }]
            })

            if (revenu && revenu.projet.demande.userId === req.user.idUser)
                next()
            else
                throw new NotFoundError()
            break;
        default:
            break;
    }
})

module.exports = { verifyPermission }