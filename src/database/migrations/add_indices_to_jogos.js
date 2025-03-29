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
        await queryInterface.addIndex('jogos', ['gols_casa'], {
            name: 'idx_jogos_gols',
            include: ['gols_fora']
        });
        await queryInterface.addIndex('filtrojogodata', ['data', 'time_id'], {
            name: 'idx_filtrojogodata_data_time'
        });
        await queryInterface.addIndex('odds', ['jogo_id', 'tipoaposta_id', 'regra_id'], {
            name: 'idx_odds_jogo_tipo'
        });
        await queryInterface.addIndex('tipoapostas', ['id'], {
            name: 'idx_tipoapostas_id'
        });
        await queryInterface.addIndex('jogos', ['casa_id', 'fora_id'], {
            name: 'idx_jogos_casa_fora'
        });
        await queryInterface.addIndex('filtrojogodata', ['time_id'], {
            name: 'idx_filtrojogodata_time_id'
        });
        await queryInterface.addIndex('times', ['id'], {
            name: 'idx_times_id'
        });
        await queryInterface.addIndex('temporadas', ['id'], {
            name: 'idx_temporadas_id'
        });
        await queryInterface.addIndex('ligas', ['id'], {
            name: 'idx_ligas_id'
        });
        await queryInterface.addIndex('pais', ['id'], {
            name: 'idx_pais_id'
        });
        await queryInterface.addIndex('odds', ['odd'], {
            name: 'idx_odds_valor',
            where: {
                odd: {
                    [Sequelize.Op.between]: [1, 4.5]
                }
            }
        });
        await queryInterface.addIndex('jogos', ['data'], {
            name: 'idx_jogos_data_asc',
            order: [['data', 'ASC']]
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeIndex('jogos', 'idx_jogos_data');
        await queryInterface.removeIndex('jogos', 'idx_jogos_casa');
        await queryInterface.removeIndex('jogos', 'idx_jogos_fora');
        await queryInterface.removeIndex('jogos', 'idx_jogos_deleted');
        await queryInterface.removeIndex('jogos', 'idx_jogos_gols');
        await queryInterface.removeIndex('filtrojogodata', 'idx_filtrojogodata_data_time');
        await queryInterface.removeIndex('odds', 'idx_odds_jogo_tipo');
        await queryInterface.removeIndex('tipoapostas', 'idx_tipoapostas_id');
        await queryInterface.removeIndex('jogos', 'idx_jogos_casa_fora');
        await queryInterface.removeIndex('filtrojogodata', 'idx_filtrojogodata_time_id');
        await queryInterface.removeIndex('times', 'idx_times_id');
        await queryInterface.removeIndex('temporadas', 'idx_temporadas_id');
        await queryInterface.removeIndex('ligas', 'idx_ligas_id');
        await queryInterface.removeIndex('pais', 'idx_pais_id');
        await queryInterface.removeIndex('odds', 'idx_odds_valor');
        await queryInterface.removeIndex('jogos', 'idx_jogos_data_asc');
    }
};
