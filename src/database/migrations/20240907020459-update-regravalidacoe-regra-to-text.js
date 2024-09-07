'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('regravalidacoes_new').catch(() => {});
    await queryInterface.dropTable('regravalidacoes_backup').catch(() => {});
    // Passo 1: Renomear a coluna antiga 'regra' para 'regra_old'
    await queryInterface.renameColumn('regravalidacoes', 'regra', 'regra_old');

    // Passo 2: Adicionar a nova coluna 'regra' como TEXT
    await queryInterface.addColumn('regravalidacoes', 'regra', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
    });

    // Passo 3: Copiar os dados de 'regra_old' para 'regra'
    await queryInterface.sequelize.query(`
      UPDATE regravalidacoes
      SET regra = regra_old;
    `);

    // Passo 4: Remover a coluna antiga 'regra_old'
    await queryInterface.removeColumn('regravalidacoes', 'regra_old');
  },

  down: async (queryInterface, Sequelize) => {
    // Reverter as alterações

    // Passo 1: Renomear a coluna 'regra' para 'regra_old'
    await queryInterface.renameColumn('regravalidacoes', 'regra', 'regra_old');

    // Passo 2: Adicionar a coluna 'regra' de volta como STRING
    await queryInterface.addColumn('regravalidacoes', 'regra', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });

    // Passo 3: Copiar os dados de 'regra_old' para 'regra'
    await queryInterface.sequelize.query(`
      UPDATE regravalidacoes
      SET regra = regra_old;
    `);

    // Passo 4: Remover a coluna 'regra_old'
    await queryInterface.removeColumn('regravalidacoes', 'regra_old');
  }
};
