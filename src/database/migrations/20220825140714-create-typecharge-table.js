'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('typecharges', {
      idTypeCharge: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nomType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('typecharges');
  }
};