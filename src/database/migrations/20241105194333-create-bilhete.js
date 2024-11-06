'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bilhetes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bilhete_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      jogo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'jogos',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      estrategia_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'estrategias',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      alert: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: null
      },
      odd_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'odds',
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

    // Adiciona uma restrição única composta para jogo_id e estrategia_id
    await queryInterface.addConstraint('bilhetes', {
      fields: ['jogo_id', 'estrategia_id'],
      type: 'unique',
      name: 'unique_jogo_estrategia' // Nome da restrição
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove a restrição única antes de excluir a tabela
    await queryInterface.removeConstraint('bilhetes', 'unique_jogo_estrategia');
    await queryInterface.dropTable('bilhetes');
  }
};
