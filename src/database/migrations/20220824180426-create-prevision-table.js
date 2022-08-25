'use strict';
const { statusPrevision } = require('../../core/utils')

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('previsions', {
      numeroTranche: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      projetId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'projets',
          key: 'idProjet',
        },
      },
        etat: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: statusPrevision.brouillon,
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
    await queryInterface.dropTable('previsions');
  }
};
