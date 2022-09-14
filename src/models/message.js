'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      this.belongsTo(models.Ticket, {foreignKey: 'ticketId', as: 'ticket'})
      this.belongsTo(models.User, {foreignKey: 'senderId', as: 'sentBy'})
    }
  }
  Message.init({
    idMessage: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ticketId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'tickets',
        key: 'idTicket',
      }
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'idUser',
      }
    },
    contenu: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    seenByUser: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName:'messages',
    sequelize,
    modelName: 'Message',
  });
  
  return Message;
};