const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../database/connection');

class Ressource extends Model {}

Ressource.init({
    idRessource: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nomRessource : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descriptionRessource : {
        type: DataTypes.STRING,
        allowNull: true
    },
}, {
    //this telling sequelize to not pluralize table name
    tableName: 'ressources',
    //providing the db instance
    sequelize,
    modelName: 'Ressource',
})

module.exports = Ressource