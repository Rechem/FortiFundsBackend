'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const types = [
      { idTypeInvestissement: 1, nomType: 'Matériel informatique', },
      { idTypeInvestissement: 2, nomType: 'Bannière' },
      { idTypeInvestissement: 3, nomType: 'Autres' },
    ];

    await queryInterface.bulkInsert('typeinvestissements', types)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('typeinvestissements', {
      where: {
        nomType: {
          [Op.or]: [
            {
              nomType: 'Matériel informatique',
              nomType: 'Bannière',
              nomType: 'Autres',
            },
          ]
        }
      }
    });
  }
};
