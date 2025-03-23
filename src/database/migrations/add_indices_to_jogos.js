'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addIndex('jogos', ['data'], {
            name: 'idx_jogos_data'
        });
        await queryInterface.addIndex('jogos', ['casa_id'], {
            name: 'idx_jogos_casa'
        });
        await queryInterface.addIndex('jogos', ['fora_id'], {
            name: 'idx_jogos_fora'
        });
        await queryInterface.addIndex('jogos', ['deletedAt'], {
            name: 'idx_jogos_deleted',
            where: {
                deletedAt: null
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeIndex('jogos', 'idx_jogos_data');
        await queryInterface.removeIndex('jogos', 'idx_jogos_casa');
        await queryInterface.removeIndex('jogos', 'idx_jogos_fora');
        await queryInterface.removeIndex('jogos', 'idx_jogos_deleted');
    }
};
