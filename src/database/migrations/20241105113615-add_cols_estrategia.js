'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('estrategias', 'media_sequencia_vitorias', {
      type: Sequelize.FLOAT,
      defaultValue: 0,
    });

    await queryInterface.addColumn('estrategias', 'maior_derrotas_dia', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('estrategias', 'maior_derrotas_semana', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('estrategias', 'maior_vitorias_dia', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('estrategias', 'maior_vitorias_semana', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('estrategias', 'media_sequencia_vitorias');
    await queryInterface.removeColumn('estrategias', 'maior_derrotas_dia');
    await queryInterface.removeColumn('estrategias', 'maior_derrotas_semana');
    await queryInterface.removeColumn('estrategias', 'maior_vitorias_dia');
    await queryInterface.removeColumn('estrategias', 'maior_vitorias_semana');
  }
};
