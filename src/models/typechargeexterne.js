'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TypeChargeExterne extends Model {
    static associate(models) {
      this.hasMany(models.ChargeExterne, { foreignKey : "typeChargeExterneId", as : 'type'})
    }
  }
  TypeChargeExterne.init({
    idTypeChargeExterne: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nomType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    timestamps: false,
    tableName: 'typechargesexternes',
    sequelize,
    modelName: 'TypeChargeExterne',
  });
  return TypeChargeExterne;
};