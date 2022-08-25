'use strict';
const {statusRealisation} = require('../../core/utils')

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('realisations', {
      projetId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'projets',
          key: 'idProjet',
        }
      },
      numeroTranche: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      etat: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: statusRealisation.waiting,
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
    await queryInterface.dropTable('realisations');
  }
};