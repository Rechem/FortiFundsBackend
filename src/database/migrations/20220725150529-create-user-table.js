'use strict';
const { DataTypes } = require('sequelize')

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users',
      {
        idUser: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        email: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: false,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        changedPassword: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        nom: {
          type: DataTypes.STRING,
          notEmpty: true,
          allowNull: true,
        },
        prenom: {
          type: DataTypes.STRING,
          notEmpty: true,
          allowNull: true,
        },
        dateNaissance: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
        wilayaNaissance: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        sexe: {
          type: DataTypes.STRING,
          allowNull: true,
          notEmpty: true,
        },
        telephone: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        adress: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        roleId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'roles',
            key: 'idRole',
            onDelete: 'SET NULL',
          }
        },
        completedSignUp: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        confirmed: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        banned: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        avatar: {
          type: DataTypes.STRING,
          allowNull: true
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
