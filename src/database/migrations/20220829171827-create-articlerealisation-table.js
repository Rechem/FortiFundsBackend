'use strict';
const {statusArticleRealisation} = require('../../core/utils')

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('articlesrealisation', {
      numeroTranche : {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'previsions',
          key: 'numeroTranche',
        }
      },
      projetId : {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'projets',
          key: 'idProjet',
        }
      },
      type: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      idArticle: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      lien: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      facture: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      etat: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue : statusArticleRealisation.waiting,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('articlesrealisation');
  }
};