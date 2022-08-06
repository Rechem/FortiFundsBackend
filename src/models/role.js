const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database/connection');

class Role extends Model {}

Role.init({
    idRole: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nomRole: {
        type: DataTypes.STRING,
        notEmpty: true,
        allowNull: false,
    },
    descriptionRole: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    //this telling sequelize to not pluralize table name
    tableName: 'roles',
    //providing the db instance
    sequelize,
    modelName: 'Role',
})

module.exports = Role