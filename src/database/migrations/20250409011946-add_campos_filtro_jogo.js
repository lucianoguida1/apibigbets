'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('filtrojogos', 'minimoJogos', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('filtrojogos', 'maximoJogos', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('filtrojogos', 'where', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('filtrojogos', 'minimoJogos');
    await queryInterface.removeColumn('filtrojogos', 'maximoJogos');
    await queryInterface.removeColumn('filtrojogos', 'where');
  }
};
