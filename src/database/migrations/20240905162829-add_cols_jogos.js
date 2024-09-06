'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('jogos', 'halftime', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn('jogos', 'fulltime', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn('jogos', 'extratime', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn('jogos', 'penalty', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('jogos', 'halftime');
    await queryInterface.removeColumn('jogos', 'fulltime');
    await queryInterface.removeColumn('jogos', 'extratime');
    await queryInterface.removeColumn('jogos', 'penalty');
  }
};
