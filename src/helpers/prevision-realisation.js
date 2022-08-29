const {  NotFoundError, } = require('../core/api-error')
const { isAdmin, isSimpleUser,} = require('../core/utils')
const {Projet, Investissement, Demande, Salaire, ChargeExterne, } = require('../models')
const db = require('../models');

const verifyOwnerShip = async (req, projetId) => {
    const projet = await Projet.findByPk(projetId, {
        include: [{
            model: Demande, attributes: ['userId'], as: 'demande'
        }]
    })

    if (!projet)
        throw new NotFoundError()

    //only admin and owner can continue
    // if (isModo(req) || isSimpleUser(req) && projet.demande.userId != req.user.idUser)
    if (!isAdmin(req) && (!isSimpleUser(req) || projet.demande.userId !== req.user.idUser))
        throw new NotFoundError()
}

const getValeur = async (projetId, numeroTranche) => {

    const sumInvestissements = await Investissement.findOne({
        where: { projetId, numeroTranche },
        attributes: [[db.sequelize.literal('SUM(montantUnitaire * quantite)'), 'totalSum']],
    })

    const sumChargesExternes = await ChargeExterne.findOne({
        where: { projetId, numeroTranche },
        attributes: [[db.sequelize.literal('SUM(montantUnitaire * quantite)'), 'totalSum']],
    })

    const sumSalaires = await Salaire.findOne({
        where: { projetId, numeroTranche },
        attributes: [[db.sequelize.literal('SUM(salaireMensuel * nbMois * nbPersonne)'), 'totalSum']],
    })

    const valeur =
        Number(sumInvestissements.toJSON().totalSum || 0)
        + Number(sumChargesExternes.toJSON().totalSum || 0)
        + Number(sumSalaires.toJSON().totalSum || 0)

    return valeur
}

module.exports= {getValeur, verifyOwnerShip}