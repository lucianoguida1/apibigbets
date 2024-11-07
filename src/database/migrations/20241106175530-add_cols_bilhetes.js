'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('bilhetes', 'status_jogo', {
      type: Sequelize.BOOLEAN,
      defaultValue: null,
    });
    await queryInterface.addColumn('bilhetes', 'status_bilhete', {
      type: Sequelize.BOOLEAN,
      defaultValue: null,
    });
    await queryInterface.addColumn('bilhetes', 'odd', {
      type: Sequelize.FLOAT,
      defaultValue: 1,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('bilhetes', 'status_jogo');
    await queryInterface.removeColumn('bilhetes', 'status_bilhete');
    await queryInterface.removeColumn('bilhetes', 'odd');
  }
};
