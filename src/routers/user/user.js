const express = require('express')
const bcryptjs = require('bcryptjs')
const { User, Role, Demande, Projet } = require('../../models')
const { ValidationError } = require('sequelize');
const { jwtVerifyAuth } = require('../../helpers/jwt-verify-auth');
const { adminRoles } = require('../../core/utils')
const { SuccessResponse, SuccessCreationResponse, AlreadyExistsResponse } = require('../../core/api-response')
const { InternalError, BadRequestError, UnauthroizedError, NotFoundError, AlreadyExistsError } = require('../../core/api-error')
const { signUpController, signInController, signOutController, signUserIn } = require('../../controllers/user');
const asyncHandler = require('../../helpers/async-handler');
const { isAdmin, isModo, isSimpleUser, getPagingData, getPagination } = require('../../core/utils')
const { addUserSchema } = require('./schema');
const sequelize = require('sequelize')

const router = new express.Router()

//signup
router.post('/signup', signUpController, signUserIn)

router.post('/login', signInController, signUserIn)

router.post('/add', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        if (!isAdmin(req))
            throw new UnauthroizedError()
        const { error } = addUserSchema.validate()

        if (error)
            throw new BadRequestError(error.details[0].message)

        const result = await User.findOne({ where: { email: req.body.email } })

        if (result)
            throw new AlreadyExistsError('Email déjà utilisé')

        await User.create(req.body)

        new SuccessCreationResponse('Utilisateur cree avec succes').send(res)
    }))

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

router.get('/', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    if (!isAdmin(req) && !isModo(req))
        throw new UnauthroizedError()

    const { search, orderBy, sortBy, page, size, } = req.query

    const { limit, offset } = getPagination(page, size)
    const orderFilter = orderBy ? sortBy ? [orderBy, sortBy] : [orderBy, 'DESC'] : ['createdAt', 'DESC']

    const users = await User.findAndCountAll({
        include: [{ model: Role, attributes: ['nomRole'], as: 'role' }],
        where: search,
        limit,
        offset,
        order: [orderFilter],
    })

    new SuccessResponse('Liste des utilisateurs',
        getPagingData(users, page, limit)
    ).send(res)
},))

router.get('/checkSignIn', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        const user = await User.authenticationResponse(req.user)
        new SuccessResponse("Authentifié avec succès", { user: user }).send(res)
    })
)

router.get('/roles', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        if (!isAdmin(req))
            throw new UnauthroizedError()

        const roles = await Role.findAll({
            attributes: ['idRole', 'nomRole']
        })

        new SuccessResponse('List des roles', { roles }).send(res)
    }))

router.post('/logout', signOutController)

router.get('/:idUser', jwtVerifyAuth, asyncHandler(async (req, res, next) => {
    
    const idUser = req.params.idUser
    
    if (!isAdmin(req) && !isModo(req) && idUser != req.user.idUser)
        throw new UnauthroizedError()

    let user = await User.findByPk(idUser, {
        attributes: {
            exclude: ['prenomNom', 'changedPassword', 'completedSignUp', 'updatedAt'],
            include: [
                [sequelize.fn('COUNT', sequelize.col('demandes.userId')), 'nbDemandes'],
            ],
        },
        include: [
            {
                model: Demande, attributes: [], as: "demandes",
            },
        ]
    })

    if (!user)
        throw new NotFoundError()

    const projetsCount = await Projet.count({
        include: [
            {
                model: Demande, attributes: [], as: "demande",
                include: [
                    {
                        model: User, attributes: ['idUser'], as: "user",
                        where: { idUser: user.idUser },
                    },
                ],
            },
        ]
    })

    user.setDataValue('nbProjets', projetsCount);

    new SuccessResponse('Succès', { user }).send(res)
},))

module.exports = router