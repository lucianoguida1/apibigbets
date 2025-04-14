"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('jogos');
    if (!tableDescription.adiado) {
      await queryInterface.addColumn('jogos', 'adiado', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      });
    }
    },

    down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('jogos', 'adiado');
  }
};