const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class Membre extends Model {
        static associate(model) {
            this.belongsTo(model.User, { foreignKey: "createdBy", })
            this.hasMany(model.Commission, { foreignKey: "presidentId", as: "commissionsPresidees" })
            this.belongsToMany(model.Commission, { through: model.MembreCommission, foreignKey: "idMembre", as: "commissions" })
        }
    }

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
            validate: {
                isEmail: {
                    msg: "Email non valid"
                },
            }
        },
    }, {
        //this telling sequelize to not pluralize table name
        tableName: 'membres',
        //providing the db instance
        sequelize,
        modelName: 'Membre',
    })

    return Membre
}