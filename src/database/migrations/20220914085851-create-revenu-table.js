'use strict';
const { statusRevenu } = require('../../core/utils')
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('revenus', {
      projetId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'projets',
          key: 'idProjet',
        },
      },
      seenByUser: {
        type: Sequelize.BOOLEAN,
        allowNull : false,
        defaultValue: false,
      },
      etat: {
        type: Sequelize.STRING,
        allowNull : false,
        defaultValue : statusRevenu.waiting
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
    await queryInterface.dropTable('revenus');
  }
};