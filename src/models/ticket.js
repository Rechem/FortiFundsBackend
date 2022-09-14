'use strict';
const {
  Model
} = require('sequelize');
const { statusTicket, motifTicket } = require('../core/utils')

module.exports = (sequelize, DataTypes) => {
  class Ticket extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'userId', as: 'createdBy' })
      this.hasMany(models.Message, { foreignKey: 'ticketId', as: 'messages' })
    }
  }
  Ticket.init({
    idTicket: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'idUser',
      }
    },
    motif: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(motifTicket)],
          msg: 'Valeur motif non valide'
        }
      }
    },
    objet: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    etat: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: statusTicket.ouvert,
      validate: {
        isIn: {
          args: [Object.values(statusTicket)],
          msg: 'Valeur etat non valide'
        }
      }
    },
  }, {
    tableName: 'tickets',
    sequelize,
    modelName: 'Ticket',
  });
  return Ticket;
};