const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database/connection');

class Membre extends Model {}

Membre.init({
    idMembre: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nomMembre: {
        type: DataTypes.STRING,
        notEmpty: true,
        allowNull: false,
    },
    prenomMembre: {
        type: DataTypes.STRING,
        notEmpty: true,
        allowNull: false,
    },
    emailMembre: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    //this telling sequelize to not pluralize table name
    tableName: 'membres',
    //providing the db instance
    sequelize,
    modelName: 'Membre',
})

module.exports = Membre