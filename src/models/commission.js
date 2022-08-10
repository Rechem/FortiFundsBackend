const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database/connection');
const User = require('./user')
const Membre = require('./membre')

class Commission extends Model {}

Commission.init({
    idCommission: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    dateCommission: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    etat : {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue : 'En attente',
        validate: {
            notEmpty: true,
            isIn: {
                args: [['En attente', 'Terminée']],
                msg: 'L\'état d\'une commission peut être autre que "En attente" et "Terminée"'
            }
        }
    },
    rapportCommission: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    //this telling sequelize to not pluralize table name
    tableName: 'commissions',
    //providing the db instance
    sequelize,
    modelName: 'Commission',
});

module.exports = Commission