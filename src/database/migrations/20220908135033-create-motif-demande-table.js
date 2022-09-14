'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('motifsdemande', {
      contenuMotif: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dateMotif: {
        type: Sequelize.DATE,
        primaryKey: true,
      },
      demandeId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'demandes',
          key: 'idDemande',
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
    await queryInterface.dropTable('motifsdemande');
  }
};