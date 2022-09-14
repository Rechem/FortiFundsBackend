'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('motifsrealisation', {
      contenuMotif: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dateMotif: {
        type: Sequelize.DATE,
        primaryKey: true,
      },
      numeroTranche : {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'realisations',
          key: 'numeroTranche',
        }
      },
      projetId : {
        type: Sequelize.INTEGER,
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
      seenByUser: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('motifsrealisation');
  }
};