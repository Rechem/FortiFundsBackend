'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TypeInvestissement extends Model {
    static associate(models) {
      this.hasMany(models.Investissement, { foreignKey : "typeInvestissementId", as : 'type'})
    }
  }
  TypeInvestissement.init({
    idTypeInvestissement: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nomType: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
    {
      timestamps: false,
      tableName: 'typeinvestissements',
      sequelize,
      modelName: 'TypeInvestissement',
    });
  return TypeInvestissement;
};