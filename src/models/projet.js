const { Model } = require('sequelize');
const { statusPrevision, statusRealisation, statusRevenu } = require('../core/utils')

module.exports = (sequelize, DataTypes) => {

    class Projet extends Model {
        static associate(models) {
            this.belongsTo(models.Demande, { foreignKey: "demandeId", as: 'demande' })
            this.belongsTo(models.Tranche, { foreignKey: "trancheId", as: 'tranche' })
            this.hasMany(models.Prevision, { foreignKey: "projetId", as: 'previsions' })
            this.hasMany(models.Realisation, { foreignKey: "projetId", as: 'realisations' })
            this.hasOne(models.Revenu, { foreignKey: "projetId", as: 'revenuProjet' })
        }

        static async updateProjet(projetId) {

            const Prevision = sequelize.models.Prevision
            const Realisation = sequelize.models.Realisation
            const Revenu = sequelize.models.Revenu
            const Tranche = sequelize.models.Tranche

            let tempAdmin = false;
            let tempUser = false;

            const projetInstance = await Projet.findByPk(projetId, {
                attributes: ['idProjet', 'urgentAdmin', 'urgentUser'],
                include: [
                    { model: Prevision, attributes: ['numeroTranche', 'etat', 'seenByUser'], as: "previsions" },
                    { model: Realisation, attributes: ['numeroTranche', 'etat', 'seenByUser'], as: "realisations" },
                    { model: Revenu, attributes: ['etat', 'seenByUser'], as: "revenuProjet" },
                    { model: Tranche, attributes: ['nbTranches'], as: "tranche" }
                ]
            })

            const revenu = projetInstance.revenuProjet

            if (revenu && revenu.etat === statusRevenu.pending) {
                tempAdmin = true
            }

            if (revenu && !revenu.seenByUser &&
                (revenu.etat === statusRevenu.pending
                    || revenu.etat === statusRevenu.waiting)) {
                tempUser = true
            }

            if (!tempAdmin && projetInstance.montant === null) {
                //priority 0
                tempAdmin = true
            } else {
                if (projetInstance.documentAccordFinancement === null) {

                    tempAdmin = true
                } else {
                    if (projetInstance.previsions.length === 0) {
                        if (projetInstance.tranche)
                            tempAdmin = true
                    } else {
                        const lastPrevision = projetInstance.previsions[projetInstance.previsions.length - 1]
                        if (lastPrevision.etat === statusPrevision.pending) {

                            tempAdmin = true
                        } else if (lastPrevision.etat === statusPrevision.accepted) {
                            if (projetInstance.realisations.length === 0) {

                                tempAdmin = true
                            } else {
                                const lastRealisation = projetInstance.realisations[projetInstance.realisations.length - 1];
                                if (lastRealisation.numeroTranche === lastPrevision.numeroTranche - 1) {

                                    tempAdmin = true
                                } else {
                                    if (lastRealisation.etat === statusRealisation.accepted
                                        && lastPrevision.numeroTranche < projetInstance.tranche.nbTranches) {

                                        tempAdmin = true
                                    }
                                    else {
                                        if (lastRealisation.etat === statusRealisation.pending
                                            || lastRealisation.etat === statusRealisation.pendingWaiting
                                            || lastRealisation.etat === statusRealisation.evaluatedPending) {
                                            tempAdmin = true
                                        }
                                    }
                                }
                            }
                        }

                    }
                }
            }

            if (!tempUser && projetInstance.montant && projetInstance.tranche === null) {
                // priority 0
                tempUser = true
                console.log('once');
            } else {
                if (projetInstance.previsions.length > 0) {
                    const lastPrevision = projetInstance.previsions[projetInstance.previsions.length - 1]
                    if (lastPrevision.etat !== statusPrevision.pending && !lastPrevision.seenByUser) {
                        //priority 0 or 2 depending on status prev
                        tempUser = true
                        console.log('twice');
                    } else {
                        if (projetInstance.realisations.length > 0) {
                            const lastRealisation = projetInstance.realisations[projetInstance.realisations.length - 1];
                            if (lastRealisation.etat !== statusRealisation.pending
                                && !(lastRealisation.etat === statusRealisation.terminee &&
                                    lastRealisation.seenByUser)
                                && !(lastRealisation.etat === statusRealisation.evaluatedPending &&
                                    lastRealisation.seenByUser)) {
                                console.log('thrice');
                                tempUser = true
                            }
                        }
                    }
                }
            }

            console.log(tempUser, tempAdmin, ' newwwest value');

            if (projetInstance.urgentAdmin !== tempAdmin
                || projetInstance.urgentUser !== tempUser) {
                projetInstance.urgentAdmin = tempAdmin
                projetInstance.urgentUser = tempUser
                await projetInstance.save({ hooks: false })
            }
        }
    }

    Projet.init({
        idProjet: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        montant: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        documentAccordFinancement: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        urgentUser: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        urgentAdmin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
    }, {
        //this telling sequelize to not pluralize table name
        tableName: 'projets',
        //providing the db instance
        sequelize,
        modelName: 'Projet',
    })

    const afterCreate = async (projet, options) => {
        const Revenu = sequelize.models.Revenu
        await Revenu.create({ projetId: projet.idProjet }, { transaction: options.transaction })
    }

    const updateProjetMW = async (projet) => {
        await Projet.updateProjet(projet.idProjet)
    }

    Projet.afterCreate(afterCreate);
    Projet.afterUpdate(updateProjetMW);

    return Projet

}