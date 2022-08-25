'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TypePoste extends Model {
    static associate(models) {
      // define association here
    }
  }
  TypePoste.init({
    idTypePoste: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nomPoste: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'typepostes',
    sequelize,
    modelName: 'TypePoste',
  });
  return TypePoste;
};