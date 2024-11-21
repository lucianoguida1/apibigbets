'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adiciona o campo dados_json na tabela pais
    await queryInterface.addColumn('pais', 'dados_json', {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    // Adiciona o campo dados_json na tabela ligas
    await queryInterface.addColumn('ligas', 'dados_json', {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    // Adiciona o campo dados_json na tabela temporadas
    await queryInterface.addColumn('temporadas', 'dados_json', {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    // Adiciona o campo dados_json na tabela times
    await queryInterface.addColumn('times', 'dados_json', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove o campo dados_json da tabela pais
    await queryInterface.removeColumn('pais', 'dados_json');

    // Remove o campo dados_json da tabela ligas
    await queryInterface.removeColumn('ligas', 'dados_json');

    // Remove o campo dados_json da tabela temporadas
    await queryInterface.removeColumn('temporadas', 'dados_json');

    // Remove o campo dados_json da tabela times
    await queryInterface.removeColumn('times', 'dados_json');
  },
};
