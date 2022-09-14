const Joi = require('joi')
const {statusArticleRealisation} = require('../../core/utils')

const articleRealisationSchema = {
    projetId: Joi.number().positive().required(),
    numeroTranche: Joi.number().positive().required(),
    type : Joi.string().valid('Investissement', 'ChargeExterne', 'Salaire'),
    lien: Joi.string().uri().allow(null,''),
    lienOuFacture: Joi.string().valid('facture', 'lien'),
    idArticle: Joi.number().positive(),
    etat : Joi.string().required().valid(...Object.values(statusArticleRealisation)),
    message: Joi.string().allow(null, '')
}

module.exports = {
    articleRealisationSchema : Joi.object(articleRealisationSchema)
}