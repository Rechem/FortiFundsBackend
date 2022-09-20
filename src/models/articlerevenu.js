'use strict';
const { Model, ValidationError } = require('sequelize');
const { statusArticleRevenu, statusRevenu } = require('../core/utils')
const { NotFoundError } = require('../core/api-error');
const dayjs = require('dayjs')

module.exports = (sequelize, DataTypes) => {
  class ArticleRevenu extends Model {
    static associate(models) {
      this.belongsTo(models.Revenu, { foreignKey: "projetId", as: 'revenu' })
    }
  }
  ArticleRevenu.init({
    idArticleRevenu: {
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
      validate: {
        isIn: {
          args: [Object.values(statusArticleRevenu)],
          msg: 'Valeur etat non valide'
        }
      }
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
    tableName: 'articlesrevenu',
    sequelize,
    modelName: 'ArticleRevenu',
  });

  const updateRevenu = async (article, options) => {
    // , { transaction: options.transaction }
    const Revenu = sequelize.models.Revenu

    let nouvelEtat;

    const revenusCount = await ArticleRevenu.count(
      {
        where: {
          projetId: article.projetId,
        },
      }, { transaction: options.transaction })

    if (revenusCount === 0) {
      nouvelEtat = statusRevenu.waiting
    } else {
      let pendingCount = await ArticleRevenu.count(
        {
          where: {
            projetId: article.projetId,
            etat : statusArticleRevenu.pending
          },
        }, { transaction: options.transaction })
        pendingCount += article.dataValues.etat === statusArticleRevenu.pending ? 1 : 0
        pendingCount -= article._previousDataValues.etat === statusArticleRevenu.pending ? 1 : 0

      if (pendingCount > 0) {
        nouvelEtat = statusRevenu.pending
      } else {
        nouvelEtat = statusRevenu.evaluated
      }
    }

    const revenu = await Revenu.findByPk(article.projetId,
      { transaction: options.transaction })

    if (!revenu)
      throw new NotFoundError('Ce revenu n\'existe pas')
    let seenByUser = true;
    if (nouvelEtat === statusRevenu.evaluated)
      seenByUser = false

    if (revenu.etat !== nouvelEtat) {
      await revenu.update({ etat: nouvelEtat, seenByUser },
        { transaction: options.transaction })
      //invoke projet update here too
    }
  }

  const afterCreateMiddleware = async (article, options) => {
    const Revenu = sequelize.models.Revenu

    const revenu = await Revenu.findByPk(article.projetId,
      { transaction: options.transaction })

    if (!revenu)
      throw new NotFoundError('Ce revenu n\'existe pas')

    await revenu.update({ etat: statusRevenu.pending },
      { transaction: options.transaction })
    //invoke projet update here too
  }

  ArticleRevenu.afterCreate(afterCreateMiddleware)
  ArticleRevenu.afterUpdate(updateRevenu)

  return ArticleRevenu;
};