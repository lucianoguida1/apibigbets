'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Adiciona a coluna 'nome' à tabela 'regravalidacoes'
    await queryInterface.addColumn('regravalidacoes', 'name', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Copia os valores da coluna 'name' para a coluna 'nome'
    await queryInterface.sequelize.query(`
      UPDATE regravalidacoes
      SET name = nome
    `);
  },

  async down (queryInterface, Sequelize) {
    // Remove a coluna 'nome' da tabela 'regravalidacoes'
    await queryInterface.removeColumn('regravalidacoes', 'name');
  }
};
