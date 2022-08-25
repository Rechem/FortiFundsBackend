'use strict';
const { Model } = require('sequelize');
const { statusPrevision } = require('../core/utils')

module.exports = (sequelize, DataTypes) => {
  class Prevision extends Model {
    static associate(models) {
      this.belongsTo(models.Projet, { foreignKey: "projetId", primaryKey: true, as: 'projet' })
    }
  }
  Prevision.init({
    numeroTranche: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement : true,
    },
    etat: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: statusPrevision.brouillon,
      validate: {
        isIn: {
          args: [Object.values(statusPrevision)],
          msg: 'Valeur etat non valide'
        }
      }
    },
  }, {
    sequelize,
    tableName: 'previsions',
    modelName: 'Prevision',
  });
  return Prevision;
};