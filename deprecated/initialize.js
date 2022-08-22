const Role = require('../src/models/role')
const User = require('../src/models/user')
const Demande = require('../src/models/demande')
const Membre = require('../src/models/membre')
const Commission = require('../src/models/commission')
const Complement = require('../src/models/complement')
const MembreCommission = require('../src/models/membre-commission')
const Projet = require('../src/models/projet')
const Tranche = require('../src/models/tranche')

// Role.hasMany(User, { foreignKey: "roleId"})
// this bitch adds  new column so fuck it
// User.belongsTo(Role, { foreignKey: "roleId", as : 'role'} )

// User.hasMany(Demande, { foreignKey : "userId"})
// this bitch adds  new column so fuck it
//this as is an alias to name the field when using include
// Demande.belongsTo(User, { foreignKey : "userId", as : 'user'})

// User.hasMany(Membre, { foreignKey : "createdBy", as : 'membres'})
// Membre.belongsTo(User, { foreignKey : "createdBy",})

// Commission.hasMany(Demande, { foreignKey : "commissionId", as : "demandes"})
// Demande.belongsTo(Commission, { foreignKey : "commissionId", as :"commission"},)

// User.hasMany(Commission, { foreignKey : "createdBy", as :"commissions"})
// Commission.belongsTo(User, { foreignKey : "createdBy"})

//O:M
// Membre.hasMany(Commission, { foreignKey : "presidentId", as :"commissionsPresidees"})
// Commission.belongsTo(Membre, { foreignKey : "presidentId", as : "president"})

//N:M
// Membre.belongsToMany(Commission, { through: MembreCommission , foreignKey : "idMembre", as : "commissions"})
// Commission.belongsToMany(Membre, { through: MembreCommission , foreignKey : "idCommission", as : "membres"})

// Demande.hasMany(Complement, {foreignKey : "demandeId", as: 'complements'} )
// Complement.belongsTo(Demande, {foreignKey : "demandeId", as : "demande"})

// User.hasMany(Complement, { foreignKey : "createdBy", as : 'complements'})
// Complement.belongsTo(User , { foreignKey : "createdBy",})

// Projet.belongsTo(Demande, { foreignKey : "demandeId", as : 'demande'})
// Projet.belongsTo(Tranche, { foreignKey : "trancheId", as : 'tranche'})
// Tranche.hasMany(Projet, { foreignKey : "trancheId", as : 'projets'})