const Joi = require('joi')

const projetSchema = {
    montant: Joi.number().min(1000),
    documentAccordFinancement: Joi.string(),
    // prenomMembre: Joi.string().required(),
    // idMembre :  Joi.number().positive().required(),
}

module.exports = {
    projetSchema: Joi.object(projetSchema),
}