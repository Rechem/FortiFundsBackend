const Role = require('./role')
const User = require('./user')
const Demande = require('./demande')
const Membre = require('./membre')
const Commission = require('./commission')

Role.hasMany(User, { foreignKey: "roleId"})
// this bitch adds  new column so fuck it
User.belongsTo(Role, { foreignKey: "roleId", as : 'role'} )

User.hasMany(Demande, { foreignKey : "userId"})
// this bitch adds  new column so fuck it
//this as is an alias to name the field when using include
Demande.belongsTo(User, { foreignKey : "userId", as : 'user'})

User.hasMany(Membre, { foreignKey : "createdBy"})
Membre.belongsTo(User, { foreignKey : "createdBy"})

User.hasMany(Commission, { foreignKey : "createdBy"})
Commission.belongsTo(User, { foreignKey : "createdBy"})

//O:M
Membre.hasMany(Commission, { foreignKey : "presidentId"})
Commission.belongsTo(Membre, { foreignKey : "presidentId", as : "president"})

//N:M
Membre.belongsToMany(Commission, { through: 'MembreCommission', foreignKey : "idMembre"})
Commission.belongsToMany(Membre, { through: 'MembreCommission', foreignKey : "idCommission"})