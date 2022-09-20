'use strict';
const { DataTypes } = require('sequelize')
const {statusDemande} = require('../../core/utils')

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('demandes', {
      idDemande: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nbEmploye: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dateCreation: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      //CONFIRM
      nif: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      //CONFIRM
      nbLabel: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      //CONFIRM
      formeJuridique: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      //CONFIRM
      denominationCommerciale: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      //CONFIRM
      montant: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      //CONFIRM
      etat: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: statusDemande.pending,
      },
      seenByUser: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      businessPlan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'idUser',
        }
      },
      commissionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'commissions',
          key: 'idCommission',
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('demandes');
  }
};
