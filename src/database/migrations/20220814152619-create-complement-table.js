'use strict';
const { DataTypes } = require('sequelize')

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('complements',
      {
        idComplement: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        nomComplement: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        cheminComplement: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        demandeId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'demandes',
            key: 'idDemande',
          },
        },
        createdBy: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'idUser',
          },
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('complements');
  }
};
