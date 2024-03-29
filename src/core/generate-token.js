const jwt = require('jsonwebtoken');
const _ = require('lodash');
const { promisify } = require('util');
const {User, Role} = require('../models')
const { InternalError, BadTokenError, UnauthroizedError } = require('../core/api-error')

//this one calls the one below it

createToken = (payload, secretKey, expiresIn) =>
    jwt.sign(payload, secretKey, {
        expiresIn,
        // production only
        // audience: process.env.JWT_AUDIENCE,
        // issuer: process.env.JWT_ISSUER
    });

createTokens = (payload, refreshSecret) => {
    const token = createToken(
        payload,
        process.env.JWT_SECRET,
        `${process.env.JWT_ACCESS_TOKEN_EXPIRES}`
    );
    const refreshToken = createToken(
        payload,
        refreshSecret,
        `${process.env.JWT_REFRESH_TOKEN_EXPIRES}`
    );

    return [token, refreshToken];
};

refreshToken = async (req) => {
    const decoded = jwt.decode(req.cookies.__rt);

    if (!decoded.idUser) {
        throw new InternalError("User not found in jwt payload");
    }

    const user = await User.findOne({
        where: {
            idUser: decoded.idUser
        },
        include : [{ model: Role, attributes: ['nomRole'], as : 'role' }]
    })

    if (!user) {
        throw new InternalError("User not found");
    }

    req.user = user.toJSON()

    const refreshSecret =
        process.env.JWT_REFRESH_SECRET + user.password;
    try {
        jwt.verify(req.cookies.__rt, refreshSecret);
    } catch (err) {
        throw new BadTokenError();
    }

    if (user.banned)
            throw new UnauthroizedError('Compte bannis')

    return createTokens(
        await User.authenticationResponse(user),
        refreshSecret
    );
};

const removeTokens = (res) => {
    const cookieOption = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false
    };
    res.clearCookie('__act', cookieOption);
    res.clearCookie('__rt', cookieOption);
}

module.exports = {
    createTokens,
    refreshToken,
    removeTokens
}