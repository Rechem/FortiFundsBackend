'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'projets', // table name
      'urgentUser', // new field name
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue : true
      },
    )
    await queryInterface.addColumn(
      'projets', // table name
      'urgentAdmin', // new field name
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue : true
      },
    )
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('projets', 'urgentUser')
    await queryInterface.removeColumn('projets', 'urgentAdmin')
  }
};
