'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('filtrojogos', 'casa', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
        await queryInterface.addColumn('filtrojogos', 'fora', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('filtrojogos', 'casa');
        await queryInterface.removeColumn('filtrojogos', 'fora');
    }
};
