const Joi = require('joi')

const membreSchema = {
    nomMembre: Joi.string().required(),
    prenomMembre: Joi.string().required(),
    emailMembre: Joi.string().email().allow(null, '').messages({
        'string.email': `Email non valide`,
      })
    ,
    idMembre :  Joi.number().positive().required(),
}

module.exports = {
    membreSchema: Joi.object(membreSchema),
}