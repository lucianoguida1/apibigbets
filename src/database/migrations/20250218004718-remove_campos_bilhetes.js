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
    const constraints = [
      'bilhetes_jogo_id_fkey',
      'bilhetes_bilhete_id_fkey',
      'bilhetes_odd_id_fkey',
      'unique_jogo_estrategia'
    ];

    for (const constraint of constraints) {
      const constraintExists = await queryInterface.sequelize.query(
      `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'bilhetes' AND constraint_name = '${constraint}'`
      );

      if (constraintExists[0].length > 0) {
      await queryInterface.removeConstraint('bilhetes', constraint);
      }
    }
    await queryInterface.removeColumn('bilhetes', 'jogo_id');
    await queryInterface.removeColumn('bilhetes', 'bilhete_id');
    await queryInterface.removeColumn('bilhetes', 'odd_id');
    await queryInterface.removeColumn('bilhetes', 'status_jogo');
    

  }
};
