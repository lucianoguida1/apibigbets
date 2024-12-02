'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('estrategias', 'chat_id', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('estrategias', 'chave_grupo', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('estrategias', 'link_grupo', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: () => Math.random().toString(36).substr(2, 4)
    });

    await queryInterface.sequelize.query('UPDATE estrategias SET chave_grupo = SUBSTRING(MD5(RANDOM()::text), 1, 4) WHERE chave_grupo IS NULL');

    await queryInterface.changeColumn('estrategias', 'chave_grupo', {
      type: Sequelize.STRING,
      allowNull: false
    });
    
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('estrategias', 'chat_id');
    await queryInterface.removeColumn('estrategias', 'chave_grupo');
    await queryInterface.removeColumn('estrategias', 'link_grupo');
  }
};
