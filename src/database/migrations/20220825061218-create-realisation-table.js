'use strict';
const { statusRealisation } = require('../../core/utils')

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('realisations', {
      numeroTranche: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      projetId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'projets',
          key: 'idProjet',
        }
      },
      etat: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: statusRealisation.waiting,
      },
      seenByUser:{
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue : false
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