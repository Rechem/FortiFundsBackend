const { DataTypes } = require('sequelize')
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
      idRole: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nomRole: {
        type: DataTypes.STRING,
        notEmpty: true,
        allowNull: false,
      },
      descriptionRole: {
        type: DataTypes.STRING,
        allowNull: true,
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
    await queryInterface.dropTable('roles');
  }
};
