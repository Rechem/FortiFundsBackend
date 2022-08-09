const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database/connection');
const bcryptjs = require('bcryptjs');
const Role = require('./role')
const _ = require('lodash')

class User extends Model {

    static async authenticationResponse(user) {
        // let user = super.toJSON();
        // Role.findByPk(user.roleId)
        const role = await User.getRole(user)
        user.role = role
        return _.pick(user, ["idUser", "completedSignUp", "role"])
    }

    static async getRole(user) {
        const role = await Role.findOne({where : {idRole : user.roleId}})
        return role.nomRole

    }
}

User.init({
    idUser: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: {
                msg: "Email non valid"
            }
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            passwordValidator(value) {
                if (!(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/).test(value))
                    throw new Error("Le mot de passe doit contenir au moins 8 caractères numériques et alphabétiques")
            }
        },
    },
    changedPassword: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    nom: {
        type: DataTypes.STRING,
        notEmpty: true,
        allowNull: true,
    },
    prenom: {
        type: DataTypes.STRING,
        notEmpty: true,
        allowNull: true,
    },
    dateNaissance: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    wilayaNaissance: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 58,
        },
    },
    sexe: {
        type: DataTypes.STRING,
        allowNull: true,
        notEmpty: true,
        validate: {
            notEmpty: true,
            isIn: {
                args: [['homme', 'femme']],
                msg: 'Le sexe doit être homme ou femme'
            }
        }
    },
    telephone: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            notEmpty: true,
            telephoneValidator(value) {
                if (value != null && !(/^\+*[0-9]+/).test(value)) {
                    throw new Error("Format telephone invalide")
                }
            }
        }
    },
    adress: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    completedSignUp: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    }
},
    {
        //this telling sequelize to not pluralize table name
        tableName: 'users',
        //providing the db instance
        sequelize,
        modelName: 'User',
    }
)


const createUserMiddleware = async (user, _) => {
    user.email = user.email.toLowerCase()
    user.password = await bcryptjs.hash(user.password, 10)
    user.changedPassword = new Date()
}

const encryptPasswordIfChanged = async (user, _) => {
    if (user.changed('password')) {
        user.password = await bcryptjs.hash(user.password, 10)
        user.changedPassword = new Date()
    }
}

const beforeUpdateMiddleware = async (user, _) => {
    await encryptPasswordIfChanged(user, _);
    if (user.nom &&
        user.prenom &&
        user.dateNaissance &&
        user.wilayaNaissance &&
        user.sexe &&
        user.telephone &&
        user.adress) {
        user.completedSignUp = true;
    }
}

User.beforeCreate(createUserMiddleware);
User.beforeUpdate(beforeUpdateMiddleware);


module.exports = User