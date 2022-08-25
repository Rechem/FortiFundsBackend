'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('typepostes', {
      idTypePoste: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nomPoste: {
        type: Sequelize.STRING,
        allowNull : false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('typepostes');
  }
};