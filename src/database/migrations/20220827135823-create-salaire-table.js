'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('salaires', {
      idSalaire: {
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
      typePosteId : {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'typepostes',
          key: 'idTypePoste',
        }
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      salaireMensuel: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      nbPersonne: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      nbMois: {
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
    await queryInterface.dropTable('salaires');
  }
};