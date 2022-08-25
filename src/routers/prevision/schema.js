const Joi = require('joi')
const { join } = require('lodash')
const { statusPrevision } = require('../../core/utils')

const previsionSchema = {
    projetId: Joi.number().positive().required(),
    // numeroTranche: Joi.number().positive(),
    // etat: Joi.string().valid(...Object.values(statusPrevision)),
}

const investissementSchema = {
    projetId: Joi.number().positive().required(),
    numeroTranche: Joi.number().positive().required(),
    idTypeInvestissement: Joi.number().positive().required(),
    description: Joi.string(),
    montantUnitaire: Joi.number().positive().min(1).required(),
    quantite: Joi.number().positive().min(1).required(),
    facture: Joi.string(),
    lien: Joi.string().uri(),
    lienOuFacture : Joi.string().required()
}

module.exports = {
    previsionSchema: Joi.object(previsionSchema),
    investissementSchema: Joi.object(investissementSchema)
}