'use strict';
const Tranche = require('../../models/tranche')
const {Op} = require('sequelize')

module.exports = {
  async up(queryInterface, Sequelize) {
    const tranchesData = [
      { idTranche: 1, nbTranches: 2, pourcentage: [0.5,0.5] },
      { idTranche: 2, nbTranches: 3, pourcentage: [0.4,0.3,0.3] },
    ];

    await queryInterface.bulkInsert('tranches', tranchesData, {}, { pourcentage: { type: new Sequelize.JSON() } })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tranches', {
      [Op.or]: [
        {
          pourcentage: [0.5,0.5],
          pourcentage: [0.4,0.3,0.3]
        },
      ]
    });
  }
};
