'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('regravalidacoes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nome: {
        type: Sequelize.STRING
      },
      regra: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      descricao: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      tipoaposta_id: {
        type: Sequelize.INTEGER,
        references: { model: 'tipoapostas', key: 'id' }
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
    await queryInterface.dropTable('regravalidacoes');
  }
};