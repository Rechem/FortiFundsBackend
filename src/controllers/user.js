const bcryptjs = require('bcryptjs')
const User = require('../models/user')
const Role = require('../models/role')
const { ValidationError } = require('sequelize');
const { roles } = require('../models/utils')
const { removeTokens } = require('../core/generate-token')
const asyncHandler = require('../helpers/async-handler')
const { BadRequestError, InternalError, AuthFailureError } = require('../core/api-error')
const { SuccessResponse } = require('../core/api-response')

const signUpController = asyncHandler(async (req, res, next) => {
console.log("nigger");
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
            throw new BadRequestError(e.errors[0].message)
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

module.exports = {
    signUpController,
    signInController,
    signOutController
}