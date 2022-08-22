const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class Role extends Model {
        static associate(model) {
            this.hasMany(model.User, { foreignKey: "roleId"})
        }

    }

    Role.init({
        idRole: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nomRole: {
            type: DataTypes.STRING,
            notEmpty: true,
            allowNull: false,
        },
        descriptionRole: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        //this telling sequelize to not pluralize table name
        tableName: 'roles',
        //providing the db instance
        sequelize,
        modelName: 'Role',
    })

    return Role

}