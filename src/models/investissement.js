'use strict';
const { Model, ValidationError } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Investissement extends Model {
    static associate(models) {
      this.belongsTo(models.Prevision, {foreignKey : 'numeroTranche', primaryKey: true, as : 'prevision'})
      this.belongsTo(models.Projet, {foreignKey : 'projetId', primaryKey: true, as : 'projet'})
      this.belongsTo(models.TypeInvestissement, {foreignKey: 'typeInvestissementId', as : 'type'})
      this.belongsTo(models.ArticleRealisation, { foreignKey: 'idInvestissement'})
    }
  }
  Investissement.init({
    idInvestissement: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numeroTranche : {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'previsions',
        key: 'numeroTranche',
      }
    },
    projetId : {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'projets',
        key: 'idProjet',
      }
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
    tableName: 'investissements',
    sequelize,
    modelName: 'Investissement',
  });
  return Investissement;
};