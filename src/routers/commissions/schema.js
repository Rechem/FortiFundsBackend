const Joi = require('joi')
const {status} = require('../../core/utils')

const commissionSchema = {
    president: Joi.number().positive().required(),
    membres: Joi.array().min(1).items(Joi.number().positive()).required(),
    dateCommission: Joi.string().required(),
    idCommission :  Joi.number().positive(),
}

module.exports = {
    commissionSchema: Joi.object(commissionSchema),
    acceptCommissionSchema: Joi.object({
        idCommission :  Joi.number().positive(),
        demandes : Joi.string(),
    })
}