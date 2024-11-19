'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('regras', 'pai_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('regras', 'liga_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('regras', 'temporada_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('regras', 'time_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('regras', 'pai_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.changeColumn('regras', 'liga_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.changeColumn('regras', 'temporada_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.changeColumn('regras', 'time_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }
};
