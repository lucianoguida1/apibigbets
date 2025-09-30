'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('combinacaofiltrojogos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      combinacao: {
        type: Sequelize.STRING
      },
      nome: {
        type: Sequelize.STRING
      },
      total_odds: {
        type: Sequelize.FLOAT
      },
      positivos: {
        type: Sequelize.INTEGER
      },
      negativos: {
        type: Sequelize.INTEGER
      },
      taxa_acerto: {
        type: Sequelize.FLOAT
      },
      media_odd: {
        type: Sequelize.FLOAT
      },
      lucro: {
        type: Sequelize.FLOAT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('combinacaofiltrojogos');
  }
};