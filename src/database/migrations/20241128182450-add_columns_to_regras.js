'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('regras', 'regravalidacoe2_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('regras', 'oddmin2', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('regras', 'oddmax2', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('regras', 'regravalidacoe3_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('regras', 'oddmin3', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('regras', 'oddmax3', {
      type: Sequelize.FLOAT,
      allowNull: true,      
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('regras', 'regravalidacoe2_id');
    await queryInterface.removeColumn('regras', 'oddmin2');
    await queryInterface.removeColumn('regras', 'oddmax2');
    await queryInterface.removeColumn('regras', 'regravalidacoe3_id');
    await queryInterface.removeColumn('regras', 'oddmin3');
    await queryInterface.removeColumn('regras', 'oddmax3');
  },
};
