const { Model } = require('sequelize');
const { status } = require('../core/utils')

module.exports = (sequelize, DataTypes) => {
    class Complement extends Model { 
        static associate(model){
            this.belongsTo(model.Demande, {foreignKey : "demandeId", as : "demande"})
            this.belongsTo(model.User , { foreignKey : "createdBy",})
        }
    }

    Complement.init({
        idComplement: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nomComplement: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cheminComplement: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        //this telling sequelize to not pluralize table name
        tableName: 'complements',
        //providing the db instance
        sequelize,
        modelName: 'Complement',
    });

    const updateDemande = async (complement, _) => {

        const Demande = sequelize.models.Demande

        const result = await Complement.findOne(
            {
                where: { demandeId: complement.demandeId, cheminComplement: null },
                attributes: [[sequelize.fn('COUNT', sequelize.col('demandeId')), 'nbComplements']],
                include: [
                    { model: Demande, attributes: [], as: "demande" },
                ],
                group: ['demandeId'],

            })

        if (!result) {
            const demande = await Demande.findByPk(complement.demandeId)
            if (demande.etat === status.complement) {
                await Demande.update({
                    etat: status.pending,
                }, { where: { idDemande: complement.demandeId } })
            }
        }
    }

    Complement.afterUpdate(updateDemande)
    return Complement
}