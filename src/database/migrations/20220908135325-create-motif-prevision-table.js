'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('motifsprevision', {
      contenuMotif: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dateMotif: {
        type: Sequelize.DATE,
        primaryKey: true,
      },
      numeroTranche: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      projetId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'projets',
          key: 'idProjet',
        },
      },
      seenByUser: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('motifsprevision');
  }
};