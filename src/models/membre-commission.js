const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

//a cross table M:N
class MembreCommission extends Model { }

MembreCommission.init({
    idCommission: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'commissions',
            key: 'idCommission',
        }
    },
    idMembre: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'membres',
            key: 'idMembre',
        }
    },
}, {
    timestamps: false,
    //this telling sequelize to not pluralize table name
    tableName: 'membrecommission',
    //providing the db instance
    sequelize,
    modelName: 'MembreCommission',
})

module.exports = MembreCommission