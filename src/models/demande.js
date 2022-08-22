const dayjs = require('dayjs');
const { Model } = require('sequelize');
const { status } = require('../core/utils')

module.exports = (sequelize, DataTypes) => {

    class Demande extends Model {
        static associate(model) {
            this.belongsTo(model.User, { foreignKey: "userId", as: 'user' })
            this.belongsTo(model.Commission, { foreignKey: "commissionId", as: "commission" },)
            this.hasMany(model.Complement, { foreignKey: "demandeId", as: 'complements' })
        }
    }


    Demande.init({
        idDemande: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nbEmploye: {
            type: DataTypes.INTEGER,
            allowNull: false,
            get(){
                // console.log(this.getDataValue('nbEmploye'));
                if(this.getDataValue('nbEmploye'))
                    return this.getDataValue('nbEmploye').toString()
                return ''
            }
        },
        dateCreation: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            get(){
                if(this.getDataValue('dateCreation'))
                    return dayjs(this.getDataValue('dateCreation')).format("DD/MM/YYYY")
                return ''
            }
        },
        //CONFIRM
        nif: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        //CONFIRM
        nbLabel: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        //CONFIRM
        formeJuridique: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: {
                    args: [['EURL', 'SARL', 'SPA', 'Entreprise individuelle', 'SNC', 'Pas encore créé']],
                    msg: 'Valeur formeJuridique non valide'
                }
            }
        },
        //CONFIRM
        denominationCommerciale: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        //CONFIRM
        montant: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: {
                    args: [['Entre 1-5 Million de dinards',
                        'Entre 5-10 Million de dinards',
                        'Entreprise individuelle',
                        'Entre 10-20 Million de dinards',
                        'Plus de 20 Million de dinars']],
                    msg: 'Valeur montant non valide'
                }
            }
        },
        //CONFIRM
        etat: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'En attente',
            validate: {
                isIn: {
                    args: [Object.values(status)],
                    msg: 'Valeur etat non valide'
                }
            }
        },
        seenByUser: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        businessPlan: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        //this telling sequelize to not pluralize table name
        tableName: 'demandes',
        //providing the db instance
        sequelize,
        modelName: 'Demande',
    });
    return Demande
}