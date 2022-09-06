const Joi = require('joi')
const { statusArticleRevenu } = require('../../core/utils')

const articleRevenuPatchSchema = {
    description: Joi.string().allow(null, ''),
    dateDebut: Joi.string().required(),
    dateFin: Joi.string().required(),
    montant: Joi.number().positive().required(),
    lien: Joi.string().uri().allow(null, ''),
    lienOuFacture: Joi.string().valid('facture', 'lien').required(),
    etat: Joi.string().valid(...Object.values(statusArticleRevenu)),
    message: Joi.string(),
    projetId: Joi.number().positive(),
}

const articleRevenuSchema = {
    idRevenu: Joi.number().positive(),
    ...articleRevenuPatchSchema
}

module.exports = {
    articleRevenuSchema: Joi.object(articleRevenuSchema),
    articleRevenuPatchSchema: Joi.object(articleRevenuPatchSchema)
}