const jwt = require('jsonwebtoken');
const _ = require('lodash');
const { promisify } = require('util');
const User = require('../models/user')
const { InternalError, BadTokenError } = require('../core/api-error')

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

refreshToken = async (req, __rt) => {
    console.log("\nrefreshing.....\n");
    const decoded = jwt.decode(__rt);

    if (!decoded.idUser) {
        throw new InternalError("User not found in jwt payload");
    }

    const user = await User.findOne({
        where: {
            idUser: decoded.idUser
        }
    })

    if (!user) {
        throw new InternalError("User not found");
    }

    req.user = user

    const refreshSecret =
        process.env.JWT_REFRESH_SECRET + user.password;
    try {
        jwt.verify(__rt, refreshSecret);
    } catch (err) {
        throw new BadTokenError();
    }

    return createTokens(
        //returns a copy of the object that filtered using the given key
        //add verified ? blocked ? role ?
        await user.authenticationResponse(),
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