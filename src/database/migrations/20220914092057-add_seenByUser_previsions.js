'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'previsions', // table name
      'seenByUser', // new field name
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue : false
      },
    )
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('previsions', 'seenByUser')
  }
};
