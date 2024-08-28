'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('odds', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nome: {
        type: Sequelize.STRING
      },
      odd: {
        type: Sequelize.FLOAT
      },
      tipoaposta_id: {
        type: Sequelize.NUMBER
      },
      jogo_id: {
        type: Sequelize.NUMBER,
        references: { model: 'jogos', key: 'id' }
      },
      bet_id: {
        type: Sequelize.NUMBER,
        references: { model: 'bets', key: 'id' }
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
    await queryInterface.dropTable('odds');
  }
};