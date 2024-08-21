'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('consultas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      chave: {
        type: Sequelize.STRING
      },
      consulta: {
        type: Sequelize.TEXT
      },
      tratamento: {
        type: Sequelize.TEXT
      },
      basededados: {
        type: Sequelize.STRING
      },
      parametros: {
        type: Sequelize.TEXT
      },
      public: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('consultas');
  }
};