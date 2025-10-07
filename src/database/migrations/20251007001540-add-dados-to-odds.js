'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Adiciona a coluna 'dados' do tipo JSON na tabela 'odds'
    await queryInterface.addColumn('odds', 'dados', {
      type: Sequelize.JSON,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove a coluna 'dados' da tabela 'odds'
    await queryInterface.removeColumn('odds', 'dados');
  }
};
