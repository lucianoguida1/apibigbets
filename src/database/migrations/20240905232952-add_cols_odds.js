'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('odds', 'regra_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: { model: 'regravalidacoes', key: 'id' }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('odds', 'regra_id');
  }
};
