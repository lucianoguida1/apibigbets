'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('regravalidacoes', 'tipoaposta_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.bulkInsert('regravalidacoes', [
      {
        id: 9999991,
        nome: 'Time(s) Selecionado(s) Ganhar',
        regra: null,
        descricao: null,
        tipoaposta_id: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        name: 'Time(s) Selecionado(s) Ganhar'
      },
      {
        id: 9999992,
        nome: 'Time(s) Selecionado(s) Empatar',
        regra: null,
        descricao: null,
        tipoaposta_id: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        name: 'Time(s) Selecionado(s) Empatar'
      },
      {
        id: 9999993,
        nome: 'Time(s) Selecionado(s) Perder',
        regra: null,
        descricao: null,
        tipoaposta_id: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        name: 'Time(s) Selecionado(s) Perder'
      },
      {
        id: 9999994,
        nome: 'Time(s) Selecionado(s) Ganhar ou Empatar',
        regra: null,
        descricao: null,
        tipoaposta_id: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        name: 'Time(s) Selecionado(s) Ganhar ou Empatar'
      },
      {
        id: 9999995,
        nome: 'Time(s) Selecionado(s) Perder ou Empatar',
        regra: null,
        descricao: null,
        tipoaposta_id: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        name: 'Time(s) Selecionado(s) Perder ou Empatar'
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('regravalidacoes', {
      id: {
        [Sequelize.Op.in]: [9999991, 9999992, 9999993, 9999994, 9999995]
      }
    }, {});
    await queryInterface.changeColumn('regravalidacoes', 'tipoaposta_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  }
};