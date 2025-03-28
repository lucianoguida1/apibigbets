'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('bilhetesodds', null, {});
    await queryInterface.bulkDelete('bilhetes', null, {});
    await queryInterface.bulkDelete('regras', null, {});
    await queryInterface.bulkDelete('estrategias', null, {});
  }
};
