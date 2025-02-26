'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('bilhetes', null, {});
    await queryInterface.bulkDelete('estrategias', null, {});
    await queryInterface.bulkUpdate('odds', { status: null }, {});
  }
};
