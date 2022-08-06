const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../database/connection');
const Role = require('./role');
const Permission = require('./permission');
const Ressource = requireo('./ressource')

class RoleRessourcePermission extends Model {}

RoleRessourcePermission.init({
    idPermission: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: Permission,
            key: 'idPermission',
        }
    },
    idRole: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: Role,
            key: 'idRole',
        }
    },
    idRessource : {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Ressource,
            key: 'idRessource',
        }
    }
}, {
    //this telling sequelize to not pluralize table name
    tableName: 'roleressourcepermission',
    //providing the db instance
    sequelize,
    modelName: 'RoleRessourcePermission',
})

module.exports = RoleRessourcePermission