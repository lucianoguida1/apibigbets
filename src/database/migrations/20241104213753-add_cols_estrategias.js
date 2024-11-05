'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('estrategias', 'odd_media', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn('estrategias', 'odd_minima', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn('estrategias', 'odd_maxima', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn('estrategias', 'media_odd_vitoriosa', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn('estrategias', 'media_odd_derrotada', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn('estrategias', 'total_apostas', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('estrategias', 'frequencia_apostas_dia', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn('estrategias', 'sequencia_vitorias', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
    
    await queryInterface.addColumn('estrategias', 'sequencia_derrotas', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('estrategias', 'total_vitorias', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('estrategias', 'total_derrotas', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('estrategias', 'lucro_total', {
      type: Sequelize.FLOAT,
      defaultValue: 0,
    }); 

    await queryInterface.addColumn('estrategias', 'qtde_usuarios', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('estrategias', 'odd_media');
    await queryInterface.removeColumn('estrategias', 'odd_minima');
    await queryInterface.removeColumn('estrategias', 'odd_maxima');
    await queryInterface.removeColumn('estrategias', 'media_odd_vitoriosa');
    await queryInterface.removeColumn('estrategias', 'media_odd_derrotada');
    await queryInterface.removeColumn('estrategias', 'total_apostas');
    await queryInterface.removeColumn('estrategias', 'frequencia_apostas_dia');
    await queryInterface.removeColumn('estrategias', 'sequencia_vitorias');
    await queryInterface.removeColumn('estrategias', 'sequencia_derrotas');
    await queryInterface.removeColumn('estrategias', 'total_vitorias');
    await queryInterface.removeColumn('estrategias', 'total_derrotas');
    await queryInterface.removeColumn('estrategias', 'lucro_total');
    await queryInterface.removeColumn('estrategias', 'qtde_usuarios');
  }
};
