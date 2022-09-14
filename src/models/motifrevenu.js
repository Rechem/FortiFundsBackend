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
    idRevenu: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    contenuMotif: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dateMotif: {
      type: DataTypes.DATE,
      primaryKey: true,
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