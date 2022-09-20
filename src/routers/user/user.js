const express = require('express')
const bcryptjs = require('bcryptjs')
const { User, Role, Demande, Projet } = require('../../models')
const { ValidationError } = require('sequelize');
const { jwtVerifyAuth } = require('../../helpers/jwt-verify-auth');
const { adminRoles } = require('../../core/utils')
const { SuccessResponse, SuccessCreationResponse, AlreadyExistsResponse } = require('../../core/api-response')
const { InternalError, BadRequestError, UnauthroizedError, NotFoundError, AlreadyExistsError, ForbiddenError } = require('../../core/api-error')
const { signUpController, signInController, signOutController, signUserIn } = require('../../controllers/user');
const asyncHandler = require('../../helpers/async-handler');
const { isAdmin, isModo, isSimpleUser, getPagingData, getPagination } = require('../../core/utils')
const { addUserSchema, resetPassword } = require('./schema');
const jwt = require('jsonwebtoken');
const { isEmail } = require('validator')
const nodemailer = require('nodemailer')
const sequelize = require('../../database/connection')
const { Op } = require('sequelize')

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

    if (req.body.banned)
        delete req.body.banned

    if (req.body.confirmed)
        delete req.body.confirmed

    try {
        await user.update(req.body)
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

    const { limit, offset } = getPagination(req.query.page, req.query.size)

    const reqArgs = {
        search: req.query.search || null,
        limit,
        offset,
        orderBy: req.query.orderBy || null,
        sortBy: req.query.sortBy || null,
    }

    let orderFilter = reqArgs.sortBy ? reqArgs.orderBy ? [reqArgs.sortBy, reqArgs.orderBy] :
        [reqArgs.sortBy, 'DESC'] : ['createdAt', 'DESC']

    const users = await User.findAndCountAll({
        include: [{ model: Role, attributes: ['nomRole'], as: 'role' }],
        where: {
            [Op.or]: [
                sequelize.where(
                    sequelize.fn("concat",
                        sequelize.col("prenom"),
                        ' ',
                        sequelize.col("nom")), {
                    [Op.like]: '%' + (reqArgs.search || '') + '%'
                }),
                sequelize.where(
                    sequelize.fn("concat",
                        sequelize.col("nom"),
                        ' ',
                        sequelize.col("prenom")), {
                    [Op.like]: '%' + (reqArgs.search || '') + '%'
                }),
                sequelize.where(
                    sequelize.col("email"), {
                    [Op.like]: '%' + (reqArgs.search || '') + '%'
                }),
                sequelize.where(
                    sequelize.col("role.nomRole"), {
                    [Op.like]: '%' + (reqArgs.search || '') + '%'
                }),
            ]
        },
        limit,
        offset,
        order: reqArgs.sortBy === 'nom-complet' ? [['nom', reqArgs.orderBy], ['prenom', reqArgs.orderBy]]
            : [orderFilter],
    })

    new SuccessResponse('Liste des utilisateurs',
        getPagingData(users, req.query.page, limit)
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

    const user = await User.findByPk(idUser, {
        attributes: {
            exclude: ['prenomNom', 'changedPassword', 'completedSignUp', 'updatedAt'],
        },
    })
    if (!user)
        throw new NotFoundError('Cet utilisateur n\'existe pas')

    const demandesCount = await Demande.count({
        where: { userId: user.idUser },
    })

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
    user.setDataValue('nbDemandes', demandesCount);

    return new SuccessResponse('Succès', { user }).send(res)
},))


router.post('/verifyEmail', asyncHandler(async (req, res, next) => {
    const token = req.body.token
    if (!token)
        throw new BadRequestError()

    try {

        const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET)

        await User.update({
            confirmed: true,
        }, {
            where: {
                idUser: decoded.idUser
            }
        })

        return new SuccessResponse('Succes').send(res)
    }
    catch (e) {
        throw new BadRequestError('Une erreur est survenue')
    }
}))

router.post('/forgotPassword', asyncHandler(async (req, res, next) => {
    const email = req.body.email
    if (!isEmail(email)) {
        throw new BadRequestError('Email invalid')
    }

    const user = await User.findOne({
        where: {
            email: req.body.email
        }
    })

    if (user) {
        if (!user.confirmed)
            throw new ForbiddenError('Veuillez d\'abbord confirmer votre email')
        if (user.banned)
            throw new ForbiddenError('Cet utilisateur est bannis')
        const token = jwt.sign(
            await User.authenticationResponse(user),
            process.env.JWT_RESETPW_SECRET,
            {
            }
        )

        const transporter = nodemailer.createTransport({
            service: process.env.MAIL_SERVICE,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PW
            }
        });

        // send mail with defined transport object
        await transporter.sendMail({
            from: 'ffunds@sdasdad.com', // sender address
            to: req.body.email, // list of receivers
            subject: "Lien de réinitialisation", // Subject line
            // text: `Lien de verification : ${process.env.FRONTEND_URL}/confirmation/${token}`, // plain text body
            html: `<b>Lien de réinitialisation : ${process.env.FRONTEND_URL}/new-password/${token}</b>`, // html body
        });
    }

    return new SuccessResponse('Consultez votre boite mail pour le lien de réinitialisation').send(res)
}))

router.post('/resetPassword',
    asyncHandler(async (req, res, next) => {
        const token = req.body.token
        if (!token)
            throw new BadRequestError('Aucun token fourni')

        try {

            const decoded = jwt.verify(token, process.env.JWT_RESETPW_SECRET)

            if (req.body.password) {
                const user = await User.findByPk(decoded.idUser)

                if (!user)
                    throw new NotFoundError('Cet utilisateur n\'existe pas')

                const isMatch = await bcryptjs.compare(req.body.password, user.password)
                if (isMatch)
                    throw new BadRequestError("Le nouveau mot de passe ne peut pas être identique à l'ancien")
                user.password = req.body.password
                await user.save()
            }


            return new SuccessResponse('Succes').send(res)
        }
        catch (e) {
            if (e instanceof ValidationError) {
                throw new BadRequestError(e.errors[0].message)
            } else
                throw e
        }
    }))

router.patch('/resetPassword/:idUser', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {

        const idUser = req.params.idUser

        if (!(isAdmin(req) || isSimpleUser(req) && req.user.idUser === idUser)) {
            throw new UnauthroizedError()
        }

        const { error } = resetPassword.validate()

        if (error)
            throw new BadRequestError(error.details[0].message)

        const user = await User.findByPk(idUser)

        if (!user)
            throw new NotFoundError()

        if (isSimpleUser(req)) {
            const isMatch = await bcryptjs.compare(req.body.oldPassword, user.password)
            if (!isMatch)
                throw new BadRequestError("Mot de passe érroné")
        }

        const isMatch = await bcryptjs.compare(req.body.newPassword, user.password)
        if (isMatch)
            throw new BadRequestError("Le nouveau mot de passe ne peut pas être identique à l'ancien")

        user.password = req.body.newPassword
        await user.save()

        return new SuccessResponse('Succès').send(res)

    }))

router.patch('/ban/:idUser', jwtVerifyAuth,
    asyncHandler(async (req, res, next) => {
        if (!isAdmin(req))
            throw new UnauthroizedError()

        const newStatus = req.body.banned
        if (newStatus === null || newStatus === undefined)
            throw new BadRequestError()

        const idUser = req.params.idUser

        const user = await User.findByPk(idUser)

        if (!user)
            throw new NotFoundError('Cet utilisateur n\'existe pas')

        user.banned = newStatus

        await user.save()

        return new SuccessResponse('Succès').send(res)
    }))

module.exports = router