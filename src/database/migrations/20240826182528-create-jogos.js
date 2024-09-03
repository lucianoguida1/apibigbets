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
        type: Sequelize.INTEGER,
        references: { model: 'times', key: 'id' }
      },
      fora_id: {
        type: Sequelize.INTEGER,
        references: { model: 'times', key: 'id' }
      },
      gols_casa: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      gols_fora: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      datahora: {
        type: Sequelize.DATE
      },
      data: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      temporada_id: {
        type: Sequelize.INTEGER,
        references: { model: 'temporadas', key: 'id' }
      },
      id_sports: {
        allowNull: true,
        type: Sequelize.INTEGER
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