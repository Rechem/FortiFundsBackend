'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TypePoste extends Model {
    static associate(models) {
      this.hasMany(models.Salaire, { foreignKey : "typePosteId", as : 'type'})
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
    timestamps: false,
    tableName: 'typepostes',
    sequelize,
    modelName: 'TypePoste',
  });
  return TypePoste;
};