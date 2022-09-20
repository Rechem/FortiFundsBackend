const bcryptjs = require('bcryptjs')
const { User, Role, sequelize } = require('../models')
const { ValidationError } = require('sequelize');
const { roles } = require('../core/utils')
const { removeTokens } = require('../core/generate-token')
const asyncHandler = require('../helpers/async-handler')
const { BadRequestError, InternalError, AuthFailureError, ForbiddenError } = require('../core/api-error')
const { SuccessResponse } = require('../core/api-response')
const createCookie = require('../core/create-cookie');
const { createTokens } = require('../core/generate-token');
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')

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

        await sequelize.transaction(async t => {


            await user.save()

            const token = jwt.sign(
                await User.authenticationResponse(user),
                process.env.JWT_EMAIL_SECRET,
                {
                }
            )

            const transporter = nodemailer.createTransport({
                service : process.env.MAIL_SERVICE,
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PW
                }
            });

            // send mail with defined transport object
            await transporter.sendMail({
                from: 'ffunds@sdasdad.com', // sender address
                to: req.body.email, // list of receivers
                subject: "Lien de confirmation", // Subject line
                // text: `Lien de verification : ${process.env.FRONTEND_URL}/confirmation/${token}`, // plain text body
                html: `<b>Lien de verification : ${process.env.FRONTEND_URL}/verifyMail/${token}</b>`, // html body
            });
        })

        return new SuccessResponse('Mail de confirmation envoye avec succes').send(res)

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
    if (!user)
        throw new AuthFailureError("Email ou mot de passe érroné(s)")

    const isMatch = await bcryptjs.compare(req.body.password, user.password)
    if (!isMatch)
        throw new AuthFailureError("Email ou mot de passe érroné(s)")

    if (user.banned)
        throw new AuthFailureError("Cet utilisateur a été bannis")

    if (!user.confirmed)
        throw new ForbiddenError("Veuillez confirmer votre adresse mail")

    req.user = user
    return next()

})

const signOutController = asyncHandler(async (req, res, next) => {
    removeTokens(res)
    new SuccessResponse("Deconnecté avec succès").send(res)
})

const signUserIn = asyncHandler(async (req, res, next) => {
    refreshSecret = process.env.JWT_REFRESH_SECRET + req.user.password
    const user = await User.authenticationResponse(req.user)
    const [token, refreshToken] = createTokens(
        user,
        refreshSecret
    )
    createCookie(res, token, '__act', process.env.ACCESS_TOKEN_COOKIE_EXPIRES);
    createCookie(res, refreshToken, '__rt', process.env.REFRESH_TOKEN_COOKIE_EXPIRES);
    new SuccessResponse("Authentifié avec succès", { user }).send(res)
})

module.exports = {
    signUpController,
    signInController,
    signOutController,
    signUserIn
}