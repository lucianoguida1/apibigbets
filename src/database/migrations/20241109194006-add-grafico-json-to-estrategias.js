'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('estrategias', 'grafico_json', {
      type: Sequelize.JSON,
      allowNull: true, // Permite valor nulo; altere se necessário
      defaultValue: null, // Define valor padrão; altere se necessário
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('estrategias', 'grafico_json');
  }
};
