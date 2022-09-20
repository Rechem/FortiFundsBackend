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

  const updateRealisation = async (article, options) => {
    const Realisation = sequelize.models.Realisation


    let waitingCount = await ArticleRealisation.count(
      {
        where: {
          projetId: article.projetId, numeroTranche: article.numeroTranche,
          etat: statusArticleRealisation.waiting
        },
      }, { transaction: options.transaction })
    waitingCount += article.dataValues.etat === statusArticleRealisation.waiting ? 1 : 0
    waitingCount -= article._previousDataValues.etat === statusArticleRealisation.waiting ? 1 : 0

    let pendingCount = await ArticleRealisation.count(
      {
        where: {
          projetId: article.projetId, numeroTranche: article.numeroTranche,
          etat: statusArticleRealisation.pending
        },
      }, { transaction: options.transaction })
    pendingCount += article.dataValues.etat === statusArticleRealisation.pending ? 1 : 0
    pendingCount -= article._previousDataValues.etat === statusArticleRealisation.pending ? 1 : 0

    let evaluated = await ArticleRealisation.count(
      {
        where: {
          projetId: article.projetId, numeroTranche: article.numeroTranche,
          etat: {
            [Op.or]: [statusArticleRealisation.accepted, statusArticleRealisation.refused]
          }
        },
      }, { transaction: options.transaction })
    evaluated += [statusArticleRealisation.accepted, statusArticleRealisation.refused]
      .includes(article.dataValues.etat) ? 1 : 0
    evaluated -= [statusArticleRealisation.accepted, statusArticleRealisation.refused]
      .includes(article._previousDataValues.etat) ? 1 : 0


    let nouvelEtat;

    if (waitingCount > 0) {
      if (pendingCount > 0)
        nouvelEtat = statusRealisation.pendingWaiting
      else {
          nouvelEtat = statusRealisation.waiting
      }
    } else {
      let refusedCount = await ArticleRealisation.count(
        {
          where: {
            projetId: article.projetId, numeroTranche: article.numeroTranche,
            etat: statusArticleRealisation.refused,
          },
        }, { transaction: options.transaction })
      refusedCount += article.dataValues.etat === statusArticleRealisation.refused ? 1 : 0
      refusedCount -= article._previousDataValues.etat === statusArticleRealisation.refused ? 1 : 0

      if (pendingCount > 0) {
        if (refusedCount > 0)
          nouvelEtat = statusRealisation.pendingWaiting
        else
          nouvelEtat = statusRealisation.pending
      }
      else {
        if (evaluated > 0)
          if (refusedCount === 0)
            nouvelEtat = statusRealisation.terminee
          else
            nouvelEtat = statusRealisation.waiting
      }
    }


    // if (pendingCount > 0) {
    //   if (waitingCount > 0) {
    //     nouvelEtat = statusRealisation.pendingWaiting
    //   } else {
    //     nouvelEtat = statusRealisation.pending
    //   }
    // } else {
    //   let evaluated = await ArticleRealisation.count(
    //     {
    //       where: {
    //         projetId: article.projetId, numeroTranche: article.numeroTranche,
    //         etat: {
    //           [Op.or]: [statusArticleRealisation.accepted, statusArticleRealisation.refused]
    //         }
    //       },
    //     }, { transaction: options.transaction })
    //   evaluated += [statusArticleRealisation.accepted, statusArticleRealisation.refused].includes(article.etat) ? 1 : 0

    //   if (waitingCount > 0) {
    //     if (evaluated > 0) {
    //       nouvelEtat = statusRealisation.evaluatedWaiting
    //     } else {
    //       nouvelEtat = statusRealisation.waiting
    //     }
    //   } else {
    //     let refusedCount = await ArticleRealisation.count(
    //       {
    //         where: {
    //           projetId: article.projetId, numeroTranche: article.numeroTranche,
    //           etat: statusArticleRealisation.refused,
    //         },
    //       }, { transaction: options.transaction })
    //     refusedCount += article.etat === statusArticleRealisation.refused ? 1 : 0

    //     if (evaluated > 0) {
    //       if (refusedCount > 0)
    //         nouvelEtat = statusRealisation.evaluated
    //       else
    //         nouvelEtat = statusRealisation.terminee
    //     }
    //   }
    // }

    const realisation = await Realisation.findOne({
      where: { projetId: article.projetId, numeroTranche: article.numeroTranche, }
    }, { transaction: options.transaction })

    if (!realisation)
      throw new NotFoundError('Cette realisation n\'existe')

    let seenByUser = true;
    if ([statusRealisation.terminee, statusRealisation.evaluatedWaiting].includes(nouvelEtat))
      seenByUser = false

    if (realisation.etat !== nouvelEtat) {
      await realisation.update({ etat: nouvelEtat, seenByUser },
        { transaction: options.transaction })
    }
  }

  // no need for a afterBulkcreate middlware as its created with etat = waiting
  ArticleRealisation.afterUpdate(updateRealisation)

  return ArticleRealisation;
};