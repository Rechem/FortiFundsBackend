'use strict';
const {User} = require('../../models/')

module.exports = {
  async up (queryInterface, Sequelize) {
    await User.bulkCreate([
      { idUser: 1, email: 'admin@admin.admin', createdAt: new Date.now(), updatedAt: new Date.now() },
    ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
