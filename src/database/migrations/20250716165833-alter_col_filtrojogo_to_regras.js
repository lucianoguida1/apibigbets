'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Remove foreign key constraint before renaming the column
    await queryInterface.removeConstraint('regras', 'regras_filtrojogo_id_fkey');
    await queryInterface.renameColumn('regras', 'filtrojogo_id', 'filtrojogo_ids');
    await queryInterface.changeColumn('regras', 'filtrojogo_ids', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.renameColumn('regras', 'filtrojogo_ids', 'filtrojogo_id');
    await queryInterface.changeColumn('regras', 'filtrojogo_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  }
};
