'use strict';
const Role = require('../../models/roles_permissions/role')
const { adminRoles } = require('../../models/utils')

module.exports = {
  async up(queryInterface, Sequelize) {
    await Role.bulkCreate([
      { idRole: 1, nomRole: adminRoles.roleSimpleUser, createdAt: new Date(), updatedAt: new Date() },
      { idRole: 2, nomRole: adminRoles.roleModerator, createdAt: new Date(), updatedAt: new Date() },
      { idRole: 3, nomRole: adminRoles.roleAdmin, createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('roles', {[Op.or]: [
      {nomRole: adminRoles.roleSimpleUser},
      {nomRole: adminRoles.roleModerator},
      {nomRole: adminRoles.roleAdmin}
    ]});

  }
};
