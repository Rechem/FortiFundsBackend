const User = require('../models/user')
const jwt = require('jsonwebtoken')
const createCookie = require('../core/create-cookie')
const { TokenExpiredError } = require('jsonwebtoken')
const { removeTokens } = require('../core/generate-token')
const {BadRequestError, AccessTokenError, AuthFailureError, InternalError} =  require('../core/api-error')

const jwtVerifyAuth = async (req, res, next) => {
    const token = req.cookies.__act;
    if (!token) {
        throw new AccessTokenError()
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findOne({
            where: {
                idUser: decoded.idUser
            }
        })

        //TODO NOT TESTED
        //this part we checking if user changed his pw
        if (!user) {
            removeTokens(res)
            throw new InternalError("User not found")
        }

        req.user = user
        //might have to check how to go from string to date and vice verca
        const passwordChangeAt = Math.round(
            new Date(`${user.toJSON().changedPassword}`).getTime() / 1000
        );

        if (passwordChangeAt > decoded.iat) {
            //more sketchiness
            removeTokens(res)
            throw new AuthFailureError("Session expirée, Veuillez vous reconnecter." );
        }

        next();
    } catch (err) {
        if (err instanceof TokenExpiredError) {
            try {
                const { __rt } = req.cookies;
                const [accessToken, newRefreshToken] = await refreshToken(req, __rt);
                if (accessToken && newRefreshToken) {
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
                }
            } catch (e) {
                removeTokens(res)
                return res.status(401).json({ status: "erreur", message: "Session expired, please log in" });
            }
        } else {
            removeTokens(res)
            return res.status(401).json({ status: "erreur", message: "Unauthorized, please login" });
        }
    }
}

module.exports = { jwtVerifyAuth }