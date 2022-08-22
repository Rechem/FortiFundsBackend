const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

class Projet extends Model {
    static associate(model){
        this.belongsTo(model.Demande, { foreignKey : "demandeId", as : 'demande'})
        this.belongsTo(model.Tranche, { foreignKey : "trancheId", as : 'tranche'})
        
    }
}

Projet.init({
    idProjet: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    montant: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    documentAccordFinancement: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    //this telling sequelize to not pluralize table name
    tableName: 'projets',
    //providing the db instance
    sequelize,
    modelName: 'Projet',
})

return Projet

}