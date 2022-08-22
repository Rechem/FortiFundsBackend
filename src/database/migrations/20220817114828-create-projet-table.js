'use strict';
const { DataTypes } = require('sequelize')

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('projets', {
      idProjet: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      montant: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      documentAccordFinancement: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      trancheId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'tranches',
          key: 'idTranche',
        }
      },
      demandeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'demandes',
          key: 'idDemande',
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
    await queryInterface.dropTable('projets')
  }
};
