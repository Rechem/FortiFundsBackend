'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MotifDemande extends Model {
    static associate(models) {
    }
  }
  MotifDemande.init({
    contenuMotif: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dateMotif: {
      type: DataTypes.DATE,
      primaryKey: true,
    },
    demandeId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'demandes',
        key: 'idDemande',
      },
    },
    seenByUser: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    timestamps: false,
    tableName: 'motifsdemande',
    sequelize,
    modelName: 'MotifDemande',
  });
  return MotifDemande;
};