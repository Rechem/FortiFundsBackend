'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chargesexternes', {
      idChargeExterne: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
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
      typeChargeExterneId : {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'typechargesexternes',
          key: 'idTypeChargeExterne',
        }
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      montantUnitaire: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      lien: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      facture: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      quantite: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
    await queryInterface.dropTable('chargesexternes');
  }
};