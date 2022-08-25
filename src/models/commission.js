const { Model } = require('sequelize');
const dayjs = require('dayjs')
const {statusCommission} = require('../core/utils');
const { object } = require('joi');

module.exports = (sequelize, DataTypes) => {
    class Commission extends Model { 

        static associate(model){
            this.hasMany(model.Demande, { foreignKey : "commissionId", as : "demandes"})
            this.belongsTo(model.User, { foreignKey : "createdBy"})
            this.belongsTo(model.Membre, { foreignKey : "presidentId", as : "president"})
            this.belongsToMany(model.Membre, { through: model.MembreCommission , foreignKey : "idCommission", as : "membres"})
        }
    }

    Commission.init({
        idCommission: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        dateCommission: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            get(){
                return dayjs(this.getDataValue('dateCommission')).format("DD/MM/YYYY")
            }
        },
        etat: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: statusCommission.pending,
            validate: {
                notEmpty: true,
                isIn: {
                    args: [Object.values(statusCommission)],
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
    })

    return Commission
}