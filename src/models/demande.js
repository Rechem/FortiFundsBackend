const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database/connection');
const User = require('./user')

class Demande extends Model {
    // getOwnerId() {
    //     return this.idUser;
    // }

}

// User.hasMany(Demande, {foreignKey : "userId"})


Demande.init({
    idDemande: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nbEmploye: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    dateCreation: {
        type: DataTypes.DATEONLY,
        allowNull: false,
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
                args: [['En attente', 'En attente complément', 'Acceptée', 'Refusée']],
                msg: 'Valeur etat non valide'
            }
        }
    },
    //TODO REMOVE ?
    seenByAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    avatar : {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    //this telling sequelize to not pluralize table name
    tableName: 'demandes',
    //providing the db instance
    sequelize,
    modelName: 'Demande',
});

module.exports = Demande