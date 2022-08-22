const Joi = require('joi')

const membreSchema = {
    nomMembre: Joi.string().required(),
    prenomMembre: Joi.string().required(),
    emailMembre: Joi.string().email().messages({
        'string.email': `Email invalide`,
      }),
    idMembre :  Joi.number().positive().required(),
}

module.exports = {
    membreSchema: Joi.object(membreSchema),
}