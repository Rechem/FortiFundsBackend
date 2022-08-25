'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class typeCharge extends Model {
    static associate(models) {
      // define association here
    }
  }
  typeCharge.init({
    idTypeCharge: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nomType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'typecharges',
    sequelize,
    modelName: 'typeCharge',
  });
  return typeCharge;
};