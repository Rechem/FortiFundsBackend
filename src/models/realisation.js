'use strict';
const { Model } = require('sequelize');
const { statusRealisation } = require('../core/utils')

module.exports = (sequelize, DataTypes) => {
  class Realisation extends Model {
    static associate(models) {
      this.belongsTo(models.Projet, { foreignKey: "projetId", primaryKey: true, as: 'projet' })
      this.hasMany(models.ArticleRealisation, { foreignKey: 'numeroTranche',  as: 'realisation' })
    }
  }
  Realisation.init({
    numeroTranche: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    projetId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'projets',
        key: 'idProjet',
      }
    },
    etat: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: statusRealisation.waiting,
      validate: {
        isIn: {
          args: [Object.values(statusRealisation)],
          msg: 'Valeur etat non valide'
        }
      }
    },
    seenByUser : {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue : false
    },
  }, {
    sequelize,
    tableName: 'realisations',
    modelName: 'Realisation',
  });

  const updateProjet = async (realisation, options) => {
    const Projet = sequelize.models.Projet
    options.transaction.afterCommit(async () =>await Projet.updateProjet(realisation.projetId))
  }

  Realisation.afterCreate(updateProjet)
  Realisation.afterUpdate(updateProjet)

  return Realisation;
};