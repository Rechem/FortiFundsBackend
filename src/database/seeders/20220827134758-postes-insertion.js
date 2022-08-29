'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const types = [
      { idTypePoste: 1, nomPoste: 'Développeur', },
      { idTypePoste: 2, nomPoste: 'Infographe' },
      { idTypePoste: 3, nomPoste: 'Autres' },
    ];

    await queryInterface.bulkInsert('typepostes', types)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('typepostes', {
      where : {
        [Sequelize.Op.or]: [
          {
            nomPoste: 'Développeur',
            nomPoste: 'Infographe',
            nomPoste: 'Autres',
          },
        ]

      }
    });
  }
};
