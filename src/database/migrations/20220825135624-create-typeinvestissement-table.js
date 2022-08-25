'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('typeinvestissements', {
      idTypeInvestissement: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nomType: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('typeinvestissements');
  }
};