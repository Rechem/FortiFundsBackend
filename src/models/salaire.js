'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Salaire extends Model {
    static associate(models) {
      this.belongsTo(models.Prevision, { foreignKey: 'numeroTranche', primaryKey: true, as: 'prevision' })
      this.belongsTo(models.Projet, { foreignKey: 'projetId', primaryKey: true, as: 'projet' })
      this.belongsTo(models.TypePoste, { foreignKey: 'typePosteId', as: 'type' })
      this.belongsTo(models.ArticleRealisation, { foreignKey: 'idSalaire' })
    }
  }
  Salaire.init({
    idSalaire: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numeroTranche: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'previsions',
        key: 'numeroTranche',
      }
    },
    projetId: {
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
    salaireMensuel: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nbPersonne: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nbMois: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'salaires',
    sequelize,
    modelName: 'Salaire',
  });
  return Salaire;
};