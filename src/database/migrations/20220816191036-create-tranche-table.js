'use strict';
const {DataTypes} = require('sequelize')

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tranches', {
      idTranche: {
        type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
      },
      nbTranches: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      pourcentage: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tranches')
  }
};
