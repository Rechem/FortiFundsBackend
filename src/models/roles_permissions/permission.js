const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../database/connection');
// const Role = require('../role')
const Ressource = require('./ressource')

class Permission extends Model {}

Permission.init({
    // idRole: {
    //     type: DataTypes.INTEGER,
    //     primaryKey: true,
    //     allowNull: false,
    //     references: {
    //         model: Role,
    //         key: 'idRole',
    //     }
    // },
    idRessource : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: Ressource,
            key: 'idRessource',
        }
    },
    canCreate : {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    canRead : {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    canUpdate : {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    canDelete : {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    checkOwnerCreate : {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    checkOwnerRead : {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    checkOwnerUpdate : {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    checkOwnerDelete : {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    //this telling sequelize to not pluralize table name
    tableName: 'permissions',
    //providing the db instance
    sequelize,
    modelName: 'Permission',
})

module.exports = Permission