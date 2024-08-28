'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('jogos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      casa_id: {
        type: Sequelize.NUMBER,
        references: { model: 'times', key: 'id' }
      },
      fora_id: {
        type: Sequelize.NUMBER,
        references: { model: 'times', key: 'id' }
      },
      gols_casa: {
        type: Sequelize.NUMBER,
        allowNull: true,
        defaultValue: null
      },
      gols_fora: {
        type: Sequelize.NUMBER,
        allowNull: true,
        defaultValue: null
      },
      datahora: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.STRING
      },
      temporada_id: {
        type: Sequelize.NUMBER,
        references: { model: 'temporadas', key: 'id' }
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
    await queryInterface.dropTable('jogos');
  }
};