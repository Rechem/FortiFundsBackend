const { Model, ValidationError } = require('sequelize');
const validator = require('validator')

module.exports = (sequelize, DataTypes) => {

    class Membre extends Model {
        static associate(model) {
            // this.belongsTo(model.User, { foreignKey: "createdBy", })
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
                emailValidator: (value) =>{
                    if (value && !validator.isEmail(value)) {
                        throw new ValidationError("Email non valide")
                    }
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