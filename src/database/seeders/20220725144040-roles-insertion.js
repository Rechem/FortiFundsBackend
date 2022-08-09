'use strict';
const Role = require('../../models/role')
const { roles } = require('../../models/utils')

module.exports = {
  async up(queryInterface, Sequelize) {
    await Role.bulkCreate([
      { idRole: 1, nomRole: roles.roleSimpleUser, createdAt: new Date(), updatedAt: new Date() },
      { idRole: 2, nomRole: roles.roleModerator, createdAt: new Date(), updatedAt: new Date() },
      { idRole: 3, nomRole: roles.roleAdmin, createdAt: new Date(), updatedAt: new Date() },
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
      {nomRole: roles.roleSimpleUser},
      {nomRole: roles.roleModerator},
      {nomRole: roles.roleAdmin}
    ]});

  }
};
