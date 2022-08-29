'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const types = [
      { idTypeChargeExterne: 1, nomType: 'Eléctricité', },
      { idTypeChargeExterne: 2, nomType: 'Eau' },
      { idTypeChargeExterne: 3, nomType: 'Autres' },
    ];

    await queryInterface.bulkInsert('typechargesexternes', types)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('typechargesexternes', {
      where: {
        [Sequelize.Op.or]: [
          {
            nomType: 'Eléctricité',
            nomType: 'Eau',
            nomType: 'Autres',
          },
        ]
      },
    });
  }
};
