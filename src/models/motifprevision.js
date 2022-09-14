'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MotifPrevision extends Model {
    static associate(models) {
    }
  }
  MotifPrevision.init({
    contenuMotif: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dateMotif: {
      type: DataTypes.DATE,
      primaryKey: true,
    },
    numeroTranche: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    projetId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'projets',
        key: 'idProjet',
      },
    },
    seenByUser: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    timestamps: false,
    tableName: 'motifsprevision',
    sequelize,
    modelName: 'MotifPrevision',
  });
  return MotifPrevision;
};