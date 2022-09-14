'use strict';
const { statusArticleRealisation, statusRealisation } = require('../core/utils')

const { Model, Op } = require('sequelize');
const { NotFoundError } = require('../core/api-error');


module.exports = (sequelize, DataTypes) => {
  class ArticleRealisation extends Model {
    static associate(models) {
      this.belongsTo(models.Projet, { foreignKey: 'projetId', as: 'projet' })
      this.belongsTo(models.Realisation, { foreignKey: 'numeroTranche', as: 'realisation' })
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
      primaryKey: true,
      validate: {
        isIn: {
          args: ['ChargeExterne', 'Investissement', 'Salaire'],
          msg: 'Le type ne peut être autre que ChargeExterne, Investissement ou Salaire.'
        }
      }
    },
    numeroTranche: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'realisations',
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
          args: [Object.values(statusArticleRealisation)],
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

  const updateRealisation = async (article, _) => {

    const Realisation = sequelize.models.Realisation

    const result = await ArticleRealisation.findAndCountAll(
      {
        where: {
          projetId: article.projetId, numeroTranche: article.numeroTranche,
          etat: { [Op.not]: statusArticleRealisation.accepted }
        },
      })

    if (result.count === 0) {
      const realisation = await Realisation.findOne({
        where: { projetId: article.projetId, numeroTranche: article.numeroTranche, }
      })

      if (!realisation)
        throw new NotFoundError('Cette realisation n\'existe')

      realisation.etat = statusRealisation.terminee

      await realisation.save()
    }
  }

  ArticleRealisation.afterUpdate(updateRealisation)

  return ArticleRealisation;
};