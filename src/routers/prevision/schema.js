const Joi = require('joi')
const { join } = require('lodash')
const { statusPrevision } = require('../../core/utils')

const previsionSchema = {
    projetId: Joi.number().positive().required(),
    // numeroTranche: Joi.number().positive(),
    // etat: Joi.string().valid(...Object.values(statusPrevision)),
}

const previsionPatchSchema = {
    etat: Joi.string().valid(...Object.values(statusPrevision)).required(),
    message : Joi.string().allow(null, '')
}

const investissementChargeSchema = {
    projetId: Joi.number().positive().required(),
    numeroTranche: Joi.number().positive().required(),
    idType: Joi.number().positive().required(),
    description: Joi.string().allow(null, ''),
    montantUnitaire: Joi.number().positive().min(1).required(),
    quantite: Joi.number().positive().min(1).required(),
    lien: Joi.string().uri(),
    lienOuFacture : Joi.string().required().valid('facture', 'lien'),
    investissementOuCharge : Joi.string().required().valid('investissement', 'charge-externe')
}

const salaireSchema = {
    projetId: Joi.number().positive().required(),
    numeroTranche: Joi.number().positive().required(),
    typePosteId: Joi.number().positive().required(),
    description: Joi.string().allow(null, ''),
    salaireMensuel: Joi.number().positive().min(1000).required(),
    nbPersonne: Joi.number().positive().min(1).required(),
    nbMois: Joi.number().positive().min(1).required(),
}

module.exports = {
    previsionSchema: Joi.object(previsionSchema),
    investissementChargeSchema: Joi.object(investissementChargeSchema),
    salaireSchema: Joi.object(salaireSchema),
    previsionPatchSchema: Joi.object(previsionPatchSchema)
}