const Joi = require('joi')

module.exports = {
    commissionSchema: Joi.object({
        president: Joi.number().positive().required(),
        membres: Joi.array().min(1).items(Joi.number().positive()).required(),
        dateCommission: Joi.string().required(),
    })
}