const Role = require('./role')
const User = require('./user')
const Demande = require('./demande')

Role.hasMany(User, { foreignKey: "roleId"})
// this bitch adds  new column so fuck it
User.belongsTo(Role, { foreignKey: "roleId"})

User.hasMany(Demande, { foreignKey : "userId"})
// this bitch adds  new column so fuck it
//this as is an alias to name the field when using include
Demande.belongsTo(User, { foreignKey : "userId", as : 'user'})