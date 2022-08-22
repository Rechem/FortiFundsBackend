const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

class Tranche extends Model { 
    static associate(model){
        this.hasMany(model.Projet, { foreignKey : "trancheId", as : 'projets'})
    }
}

Tranche.init({
    idTranche: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    nbTranches: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    pourcentage: {
        type: DataTypes.JSON,
        allowNull: false,
    },
}, {
    timestamps: false,
    //this telling sequelize to not pluralize table name
    tableName: 'tranches',
    //providing the db instance
    sequelize,
    modelName: 'Tranche',
});

return Tranche

}
