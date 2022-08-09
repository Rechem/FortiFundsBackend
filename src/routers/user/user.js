const express = require('express')
const bcryptjs = require('bcryptjs')
const User = require('../../models/user')
const Role = require('../../models/role')
const { ValidationError } = require('sequelize');
const signUserIn = require('../../helpers/sign-user-in')
const { jwtVerifyAuth } = require('../../helpers/jwt-verify-auth');
const { adminRoles } = require('../../models/utils')
const { SuccessResponse } = require('../../core/api-response')
const { InternalError, BadRequestError } = require('../../core/api-error')
const { signUpController, signInController, signOutController } = require('../../controllers/user');
const asyncHandler = require('../../helpers/async-handler');


const router = new express.Router()

//signup
router.post('/signup', signUpController, signUserIn)

router.post('/login', signInController, signUserIn)

router.put('/:idUser', jwtVerifyAuth,
    async (req, res) => {
        // try {
        const user = await User.findByPk(req.params.idUser)
        if (!user) {
            throw new InternalError("User not found")
        }

        try {
            await user.update(req.body)
            req.user = await User.authenticationResponse(user)
            new SuccessResponse("Profil mis à jour avec succès", { user : req.user }).send(res)
        } catch (e) {
            if (e instanceof ValidationError) {
                throw new BadRequestError(e.errors[0].message)
            } else
                throw e
        }
    })

// router.get('/me', jwtVerifyAuth, async (req, res) => {
//     console.log(req.path)
//     const user = await User.findByPk(req.body.idUser)
//     req.entity = user
//     next()

// },)

router.get('/checkSignIn', jwtVerifyAuth,
    asyncHandler(async (req, res) => {
        const user = await User.authenticationResponse(req.user)
        new SuccessResponse("Authentifié avec succès", { user: user }).send(res)
    })
)

router.post('/logout', signOutController)

module.exports = router