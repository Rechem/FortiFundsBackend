const Joi = require('joi')

module.exports = {
    authentication: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().pattern(new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)).required()
    }),
    userId: Joi.number().positive().required(),
    completeSignUp: Joi.object({
        nom: Joi.string().required(),
        prenom: Joi.string().required(),
        dateNaissance: Joi.string().required(),
        wilayaNaissance: Joi.number().positive().max(58).required(),
        sexe: Joi.string().valid('homme', 'femme').required(),
        telephone: Joi.string().pattern(new RegExp(/^\+*[0-9]+/)).required(),
        adress: Joi.string().required(),
    })
}