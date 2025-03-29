'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('filtrojogos', 'ambos_times');
        await queryInterface.addColumn('filtrojogos', 'so_casa', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });
        await queryInterface.addColumn('filtrojogos', 'so_fora', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('filtrojogos', 'so_casa');
        await queryInterface.removeColumn('filtrojogos', 'so_fora');
    }
};
