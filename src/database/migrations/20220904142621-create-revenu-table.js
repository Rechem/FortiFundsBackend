'use strict';
const {statusRevenu} = require('../../core/utils')

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('revenus', {
      idRevenu : {
        type : Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
        defaultValue: statusRevenu.waiting,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      dateDebut: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      dateFin: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      montant: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      lien: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      facture: {
        type: Sequelize.STRING,
        allowNull: true,
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