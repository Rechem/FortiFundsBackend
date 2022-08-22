const bcryptjs = require('bcryptjs')
const { User, Role } = require('../models')
const { ValidationError } = require('sequelize');
const { roles } = require('../core/utils')
const { removeTokens } = require('../core/generate-token')
const asyncHandler = require('../helpers/async-handler')
const { BadRequestError, InternalError, AuthFailureError } = require('../core/api-error')
const { SuccessResponse } = require('../core/api-response')
const createCookie = require('../core/create-cookie');
const { createTokens } = require('../core/generate-token');

const signUpController = asyncHandler(async (req, res, next) => {
    const [user, built] = await User.findOrBuild({
        where: { email: req.body.email },
        defaults: { ...req.body, }
    })

    if (!built) {
        throw new AuthFailureError("Email déjà utilisé")
    }

    const role = await Role.findOne({
        where: { nomRole: roles.roleSimpleUser }
    })

    if (!role) {
        throw new InternalError()
    }

    user.roleId = role.idRole;
    try {
        await user.save()
        req.user = user
        return next()

    } catch (e) {
        if (e instanceof ValidationError) {
            throw new BadRequestError()
        } else
            throw e
    }
})

const signInController = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({
        where: {
            email: req.body.email
        }
    })
    if (user) {
        const isMatch = await bcryptjs.compare(req.body.password, user.password)
        if (isMatch) {
            req.user = user
            return next()
        }
    }

    throw new AuthFailureError("Email ou mot de passe érroné(s)")
})

const signOutController = asyncHandler(async (req, res, next) => {
    removeTokens(res)
    new SuccessResponse("Deconnecté avec succès").send(res)
})

const signUserIn = asyncHandler(async (req, res, next) => {
    refreshSecret = process.env.JWT_REFRESH_SECRET + req.user.password
    const [token, refreshToken] = createTokens(
        {
            idUser: req.user.idUser,
            completedSignup: req.user.completedSignup,
            // verified: req.user.verified,
            // blocked: req.user.blocked,
            role: req.user.role
        },
        refreshSecret
    )
    createCookie(res, token, '__act', process.env.ACCESS_TOKEN_COOKIE_EXPIRES);
    createCookie(res, refreshToken, '__rt', process.env.REFRESH_TOKEN_COOKIE_EXPIRES);
    const user = await User.authenticationResponse(req.user)
    new SuccessResponse("Authentifié avec succès", { user }).send(res)
})

module.exports = {
    signUpController,
    signInController,
    signOutController,
    signUserIn
}