'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('regras', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pai_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      liga_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      temporada_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      time_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      odd_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      estrategia_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'estrategias',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('regras');
  }
};