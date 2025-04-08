'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('regras', 'fjcasa_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'filtrojogos',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('regras', 'fjfora_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'filtrojogos',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('regras', 'fjcasa_id');
    await queryInterface.removeColumn('regras', 'fjfora_id');
  }
};
