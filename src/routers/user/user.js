const express = require('express')
const bcryptjs = require('bcryptjs')
const { User, Role } = require('../../models')
const { ValidationError } = require('sequelize');
const { jwtVerifyAuth } = require('../../helpers/jwt-verify-auth');
const { adminRoles } = require('../../core/utils')
const { SuccessResponse } = require('../../core/api-response')
const { InternalError, BadRequestError, UnauthroizedError, NotFoundError } = require('../../core/api-error')
const { signUpController, signInController, signOutController, signUserIn } = require('../../controllers/user');
const asyncHandler = require('../../helpers/async-handler');
const { isAdmin, isModo, isSimpleUser, getPagingData, getPagination } = require('../../core/utils')


const router = new express.Router()

//signup
router.post('/signup', signUpController, signUserIn)

router.post('/login', signInController, signUserIn)

router.patch('/:idUser', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    if (!isSimpleUser(req) && !isAdmin(req))
        throw new UnauthroizedError()

    const user = await User.findByPk(req.params.idUser)
    if (!user)
        throw new NotFoundError("Cet utilisateur n'existe pas.")

    try {
        await user.update(req.body)
        // req.user = await User.authenticationResponse(user)
        // we're not returning the new user
        new SuccessResponse("Profil mis à jour avec succès").send(res)
    } catch (e) {
        if (e instanceof ValidationError) {
            throw new BadRequestError(e.errors[0].message)
        } else
            throw e
    }
}))

router.get('/', jwtVerifyAuth, asyncHandler(async (req, res) => {
    if (!isAdmin(req) && !isModo(req))
        throw new UnauthroizedError()

    const { search, orderBy, sortBy, page, size, } = req.query

    const { limit, offset } = getPagination(page, size)
    const orderFilter = orderBy ? sortBy ? [orderBy, sortBy] : [orderBy, 'DESC'] : ['createdAt', 'DESC']

    const users = await User.findAndCountAll({
        include : [{model : Role, attributes : ['nomRole'], as : 'role'}],
        where: search,
        limit,
        offset,
        order: [orderFilter],
    })

    new SuccessResponse('Liste des utilisateurs',
    getPagingData(users, page, limit)
    ).send(res)
},))

router.get('/me', jwtVerifyAuth,
    asyncHandler(async (req, res) => {
        const user = await User.findByPk(req.body.idUser)
        req.entity = user
        next()
    },))

router.get('/checkSignIn', jwtVerifyAuth,
    asyncHandler(async (req, res) => {
        const user = await User.authenticationResponse(req.user)
        new SuccessResponse("Authentifié avec succès", { user: user }).send(res)
    })
)

router.post('/logout', signOutController)

module.exports = router