'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MotifRealisation extends Model {
    static associate(models) {
      
    }
  }
  MotifRealisation.init({
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
      references: {
        model: 'realisations',
        key: 'numeroTranche',
      }
    },
    projetId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'projets',
        key: 'idProjet',
      }
    },
    type: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    idArticle: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    seenByUser: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    timestamps: false,
    tableName: 'motifsrealisation',
    sequelize,
    modelName: 'MotifRealisation',
  });
  return MotifRealisation;
};