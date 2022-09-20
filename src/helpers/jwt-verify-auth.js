const { User, Role } = require('../models')
const jwt = require('jsonwebtoken')
const createCookie = require('../core/create-cookie')
const { TokenExpiredError } = require('jsonwebtoken')
const { removeTokens, refreshToken } = require('../core/generate-token')
const asyncHandler = require('./async-handler')
const { BadRequestError, AccessTokenError, AuthFailureError, InternalError, UnauthroizedError } = require('../core/api-error')

const jwtVerifyAuth = asyncHandler(async (req, res, next) => {
    const token = req.cookies.__act;
    if (!token) {
        throw new AccessTokenError()
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findOne({
            where: {
                idUser: decoded.idUser
            },
            include: [{ model: Role, attributes: ['nomRole'], as: 'role' }]
        })

        //TODO NOT TESTED
        //this part we checking if user changed his pw
        if (!user) {
            removeTokens(res)
            throw new InternalError("User not found")
        }

        if (user.banned)
            throw new UnauthroizedError('Compte bannis')

        if (!user.confirmed)
            throw new UnauthroizedError('Veuillez confirmer votre adresse email')

        req.user = user.toJSON()

        //might have to check how to go from string to date and vice verca
        const passwordChangeAt = Math.round(
            new Date(`${user.toJSON().changedPassword}`).getTime() / 1000
        );

        if (passwordChangeAt > decoded.iat) {
            //more sketchiness
            removeTokens(res)
            throw new AuthFailureError("Session expirée, Veuillez vous reconnecter.");
        }

        next();
    } catch (err) {
        if (err instanceof TokenExpiredError) {
            try {
                const [accessToken, newRefreshToken] = await refreshToken(req);

                createCookie(
                    res,
                    accessToken,
                    "__act",
                    process.env.ACCESS_TOKEN_COOKIE_EXPIRES
                );

                createCookie(
                    res,
                    newRefreshToken,
                    "__rt",
                    process.env.REFRESH_TOKEN_COOKIE_EXPIRES
                );

                next();
            } catch (e) {
                removeTokens(res)
                throw new AuthFailureError("Session expirée, Veuillez vous reconnecter.");
            }
        } else {
            removeTokens(res)
            throw new AuthFailureError("Session expirée, Veuillez vous reconnecter.");
        }
    }
})

module.exports = { jwtVerifyAuth }