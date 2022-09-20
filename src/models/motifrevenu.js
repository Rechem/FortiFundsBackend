'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MotifRevenu extends Model {
    static associate(models) {
    }
  }
  MotifRevenu.init({
    idArticleRevenu: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'articlesrevenu',
        key: 'idArticleRevenu',
      }
    },
    projetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'projets',
        key: 'idProjet',
      },
    },
    dateMotif: {
      type: DataTypes.DATE,
      primaryKey: true,
    },
    contenuMotif: {
      type: DataTypes.STRING,
      allowNull: false
    },
    seenByUser: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    timestamps: false,
    tableName: 'motifsrevenu',
    sequelize,
    modelName: 'MotifRevenu',
  });
  return MotifRevenu;
};