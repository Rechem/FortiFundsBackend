const { Sequelize } = require('sequelize');
require('dotenv').config()
// const User = require('../models/user')
// const Role = require('../models/roles_permissions/role')
// const Demande = require('../models/demande')

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  }).catch(e => {
    console.error('Unable to connect to the database:', e);
  })

// Role.hasMany(User, { foreignKey: "idRole" })
// User.belongsTo(Role)
// User.hasMany(Demande, { foreignKey: "userId" })
// Demande.belongsTo(User)

module.exports = sequelize
module.exports = sequelize