'use strict';
const {statusRevenu} = require('../core/utils')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Revenu extends Model {
    static associate(models) {
      this.hasMany(models.ArticleRevenu, {foreignKey : 'projetId', as : 'revenus'})
      this.belongsTo(models.Projet, { foreignKey : "projetId", as : 'projetRevenu'})
    }
  }
  Revenu.init({
    projetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'projets',
        key: 'idProjet',
      },
    },
    seenByUser: {
      type: DataTypes.BOOLEAN,
      allowNull : false,
      defaultValue: false,
    },
    etat: {
      type: DataTypes.STRING,
      allowNull : false,
      defaultValue : statusRevenu.waiting,
      validate: {
        isIn: {
          args: [Object.values(statusRevenu)],
          msg: 'Valeur etat non valide'
        }
      }
    },
  }, {
    tableName: 'revenus',
    sequelize,
    modelName: 'Revenu',
  });

  const updateProjet = async (revenu, options) => {
    const Projet = sequelize.models.Projet
    options.transaction.afterCommit(async () =>await Projet.updateProjet(revenu.projetId))
  }

  //no create hook cz by default urgentUser = 1
  Revenu.afterUpdate(updateProjet)

  return Revenu;
};