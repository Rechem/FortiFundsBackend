'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('motifsrevenu', {
      idRevenu: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      contenuMotif: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dateMotif: {
        type: Sequelize.DATE,
        primaryKey: true,
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
      seenByUser: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('motifsrevenu');
  }
};