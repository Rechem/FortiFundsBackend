'use strict';
const { DataTypes } = require('sequelize')

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('commissions',
      {
        idCommission: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        dateCommission: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        etat: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'En attente',
        },
        rapportCommission: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        createdBy: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'idUser',
          }
        },
        presidentId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'membres',
            key: 'idMembre',
          }
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: new Date()
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: new Date()
        },
      })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('commissions');
  }
};
