'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'users', // table name
      'confirmed', // new field name
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    )

    await queryInterface.addColumn(
      'users', // table name
      'banned', // new field name
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'confirmed')
    await queryInterface.removeColumn('users', 'banned')
  }
};
