'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('motifsrevenu', {
      projetId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'projets',
          key: 'idProjet',
        },
      },
      idArticleRevenu: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'articlesrevenu',
          key: 'idArticleRevenu',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      dateMotif: {
        type: Sequelize.DATE,
        primaryKey: true,
      },
      contenuMotif: {
        type: Sequelize.STRING,
        allowNull: false,
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