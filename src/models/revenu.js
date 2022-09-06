'use strict';
const { Model, ValidationError } = require('sequelize');
const { statusArticleRevenu } = require('../core/utils')
const dayjs = require('dayjs')

module.exports = (sequelize, DataTypes) => {
  class Revenu extends Model {
    static associate(models) {
      this.belongsTo(models.Projet, { foreignKey: "projetId", as: 'projet' })
    }
  }
  Revenu.init({
    idRevenu: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    etat: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: statusArticleRevenu.pending,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dateDebut: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        dateDebutValidator(_) {
          if (this.dateFin < this.dateDebut) {
            throw new ValidationError("La date fin ne peut pas précéder la date début");
          }
        }
      },
      get() {
        return dayjs(this.getDataValue('dateDebut')).format("DD/MM/YYYY")
      }
    },
    dateFin: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        dateFinValidator(_) {
          if (this.dateFin < this.dateDebut) {
            throw new ValidationError("La date fin ne peut pas précéder la date début");
          }
        }
      },
      get() {
        return dayjs(this.getDataValue('dateFin')).format("DD/MM/YYYY")
      }
    },
    montant: {
      type: DataTypes.INTEGER,
      allowNull: false
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
  }, {
    tableName: 'revenus',
    sequelize,
    modelName: 'Revenu',
  });
  return Revenu;
};