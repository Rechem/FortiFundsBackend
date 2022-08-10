'use strict';
const { DataTypes } = require('sequelize')

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('membrecommission', {
      idCommission: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'commissions',
          key: 'idCommission',
        }
      },
      idMembre: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'membres',
          key: 'idMembre',
        }
      },
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('membrecommission')
  }
};
