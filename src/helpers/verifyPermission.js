const asyncHandler = require('./async-handler')
const { isAdmin, isModo, fieldNames } = require('../core/utils')
const { Demande, Complement, Projet } = require('../models')
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
            const projet = await Projet.findOne({
                attributes: [],
                include: [{ model: Demande, attributes: ['userId'], as: 'demande' }],
                where: { documentAccordFinancement: ressourceName }
            })
            if (projet && projet.demande.userId === req.user.idUser)
                next()
            else
                throw new NotFoundError()
            break;
        default:
            break;
    }
})

module.exports = { verifyPermission }