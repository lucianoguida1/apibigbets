'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Passo 1: Criar uma nova tabela com a coluna `regra` como TEXT
    await queryInterface.createTable('regravalidacoes_new', {
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
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });

    // Passo 2: Copiar dados da tabela antiga para a nova tabela
    await queryInterface.sequelize.query(`
      INSERT INTO regravalidacoes_new (id, nome, regra, descricao, createdAt, tipoaposta_id, updatedAt, deletedAt)
      SELECT id, nome, regra, descricao, tipoaposta_id, createdAt, updatedAt, deletedAt FROM regravalidacoes;
    `);

    // Passo 3: Excluir a tabela antiga
    await queryInterface.dropTable('regravalidacoes');

    // Passo 4: Renomear a nova tabela para o nome original
    await queryInterface.renameTable('regravalidacoes_new', 'regravalidacoes');
  },

  down: async (queryInterface, Sequelize) => {
    // Para reverter, você pode recriar a tabela original com o tipo de dado antigo

    // Criar a tabela antiga de novo
    await queryInterface.createTable('regravalidacoes_old', {
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
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });

    // Copiar os dados de volta
    await queryInterface.sequelize.query(`
      INSERT INTO regravalidacoes_old (id, nome, regra, descricao, tipoaposta_id, createdAt, updatedAt, deletedAt)
      SELECT id, nome, regra, descricao, tipoaposta_id, createdAt, updatedAt, deletedAt FROM regravalidacoes;
    `);

    // Excluir a tabela nova
    await queryInterface.dropTable('regravalidacoes');

    // Renomear de volta
    await queryInterface.renameTable('regravalidacoes_old', 'regravalidacoes');
  }
};
