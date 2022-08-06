const createCookie = require('../core/create-cookie');
const { createTokens } = require('../core/generate-token');
const asyncHandler = require('./async-handler')
const {SuccessResponse} = require('../core/api-response')

const signUserIn = asyncHandler(async (req, res, next) => {
    refreshSecret = process.env.JWT_REFRESH_SECRET + req.user.password
    const [token, refreshToken] = createTokens(
        {
            idUser: req.user.idUser,
            completedSignup : req.user.completedSignup,
            // verified: req.user.verified,
            // blocked: req.user.blocked,
            role: req.user.role
        },
        refreshSecret
    )
    createCookie(res, token, '__act', process.env.ACCESS_TOKEN_COOKIE_EXPIRES);
    createCookie(res, refreshToken, '__rt', process.env.REFRESH_TOKEN_COOKIE_EXPIRES);
    
    new SuccessResponse("Authentifié avec succès", {user : req.user}).send(res)
})

module.exports = signUserIn