'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  async up (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeConstraint('bilhetes', 'bilhetes_jogo_id_fkey');
    await queryInterface.removeConstraint('bilhetes', 'bilhetes_bilhete_id_fkey');
    await queryInterface.removeConstraint('bilhetes', 'bilhetes_odd_id_fkey');
    await queryInterface.removeColumn('bilhetes', 'jogo_id');
    await queryInterface.removeColumn('bilhetes', 'bilhete_id');
    await queryInterface.removeColumn('bilhetes', 'odd_id');
    await queryInterface.removeColumn('bilhetes', 'status_jogo');
    

  }
};
