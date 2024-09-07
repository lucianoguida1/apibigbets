'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('odds', 'status', {
      type: Sequelize.BOOLEAN,
      allowNull: true, // Permite que o valor seja nulo
      defaultValue: null, // Valor padrão é nulo
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('odds', 'status');
  }
};
