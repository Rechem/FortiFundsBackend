'use strict';
const { statusTicket } = require('../../core/utils')

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tickets', {
      idTicket : {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'idUser',
        }
      },
      motif: {
        type: Sequelize.STRING,
        allowNull: false,
        //add types later
      },
      objet: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      etat: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: statusTicket.ouvert,
        //add etat later
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tickets');
  }
};