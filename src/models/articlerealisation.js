'use strict';
const {statusRealisation} = require('../core/utils')

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ArticleRealisation extends Model {
    static associate(models) {
      this.belongsTo(models.Projet, { foreignKey: 'projetId', primaryKey: true, as: 'projet' })
      this.belongsTo(models.Realisation, { foreignKey: 'numeroTranche', primaryKey: true, as: 'realisation' })
      this.hasOne(models.ChargeExterne, { foreignKey: 'idChargeExterne', targetKey: 'idArticle' })
      this.hasOne(models.Salaire, { foreignKey: 'idSalaire', targetKey: 'idArticle' })
      this.hasOne(models.Investissement, { foreignKey: 'idInvestissement', targetKey: 'idArticle' })
    }
  }
  ArticleRealisation.init({
    idArticle: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn : {
          args : ['ChargeExterne', 'Investissement', 'Salaire'],
          msg: 'Le type ne peut être autre que ChargeExterne, Investissement ou Salaire.'
        }
      }
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
    etat: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(statusRealisation)],
          msg: 'Valeur etat non valide'
        }
      }
    },
  }, {
    tableName: 'articlesrealisation',
    timestamps: false,
    sequelize,
    modelName: 'ArticleRealisation',
  });
  return ArticleRealisation;
};