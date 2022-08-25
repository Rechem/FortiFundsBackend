const express = require('express')
const { UnauthroizedError, BadRequestError, NotFoundError } = require('../../core/api-error')
const { SuccessCreationResponse, SuccessResponse } = require('../../core/api-response')
const asyncHandler = require('../../helpers/async-handler')
const { jwtVerifyAuth } = require('../../helpers/jwt-verify-auth')
const { isAdmin, isModo, isSimpleUser } = require('../../core/utils')
const { Tranche } = require('../../models')

const router = new express.Router()

router.get('/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    const tranches = await Tranche.findAll()

    new SuccessResponse('List des tranches', {tranches}).send(res)
}))

module.exports = router