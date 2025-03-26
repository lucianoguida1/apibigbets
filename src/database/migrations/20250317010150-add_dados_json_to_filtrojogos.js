'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {

        // Cria a nova tabela filtrojogodata
        await queryInterface.createTable('filtrojogodata', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            filtrojogo_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'filtrojogos',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            data: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            time_id: {
                type: Sequelize.INTEGER,
                allowNull: false
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Remove a tabela filtrojogodata
        await queryInterface.dropTable('filtrojogodata');
    }
};