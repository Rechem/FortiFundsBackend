'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChargeExterne extends Model {
    static associate(models) {
      this.belongsTo(models.Prevision, { foreignKey: 'numeroTranche', primaryKey: true, as: 'prevision' })
      this.belongsTo(models.Projet, { foreignKey: 'projetId', primaryKey: true, as: 'projet' })
      this.belongsTo(models.TypeChargeExterne, { foreignKey: 'typeChargeExterneId', as: 'type' })
      this.belongsTo(models.ArticleRealisation, { foreignKey: 'idChargeExterne'})
    }
  }
  ChargeExterne.init({
    idChargeExterne: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    montantUnitaire: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lien: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        lienValidator(value) {
          if (value === null && this.facture === null) {
            throw new ValidationError("Lien et facture ne peuvent pas être vides simultanément");
          }
        }
      }
    },
    facture: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        factureValidator(value) {
          if (value === null && this.lien === null) {
            throw new ValidationError("Lien et facture ne peuvent pas être vides simultanément");
          }
        }
      }
    },
    quantite: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'chargesexternes',
    sequelize,
    modelName: 'ChargeExterne',
  });
  return ChargeExterne;
};