'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('temporadas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ano: {
        type: Sequelize.STRING
      },
      inicio: {
        allowNull: true,
        type: Sequelize.DATE
      },
      fim: {
        allowNull: true,
        type: Sequelize.DATE
      },
      liga_id: {
        type: Sequelize.NUMBER,
        references: { model: 'ligas', key: 'id' }
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
    await queryInterface.dropTable('temporadas');
  }
};