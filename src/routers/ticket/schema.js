const Joi = require('joi')
const { motifTicket, statusTicket } = require('../../core/utils')

const ticketSchema = {
    motif: Joi.string().required().valid(...Object.values(motifTicket)),
    objet: Joi.string().required(),
    contenu: Joi.string().required(),
}

const messageSchema = {
    contenu: Joi.string().required(),
}

const ticketPatchSchema = {
    etat : Joi.string().required().valid(...Object.values(statusTicket))
}

module.exports = {
    ticketSchema: Joi.object(ticketSchema),
    messageSchema: Joi.object(messageSchema),
    ticketPatchSchema: Joi.object(ticketPatchSchema),
}