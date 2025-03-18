'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.query(`
            INSERT INTO public.filtrojogos (
                    nome, sql, "createdAt", "updatedAt", "deletedAt"
                ) 
                VALUES (
                    'Taxa de empate acima de 60 %', 
                    'WITH jogos_filtrados AS (
                SELECT 
                    data,
                    casa_id,
                    fora_id,
                    CASE 
                        WHEN gols_casa > gols_fora THEN casa_id
                        WHEN gols_fora > gols_casa THEN fora_id
                        ELSE NULL
                    END AS vencedor,
                    CASE 
                        WHEN gols_casa = gols_fora THEN 1 ELSE 0 
                    END AS empate
                FROM jogos
            ),
            jogos_expandido AS (
                SELECT data, casa_id AS id_time, vencedor, empate, TRUE AS jogo_em_casa FROM jogos_filtrados
                UNION ALL
                SELECT data, fora_id AS id_time, vencedor, empate, FALSE AS jogo_em_casa FROM jogos_filtrados
            )
            select * from (
            SELECT 
                data,
                id_time,

                -- Totais
                COUNT(*) OVER (PARTITION BY id_time ORDER BY data ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS total_jogos,
                SUM(CASE WHEN vencedor = id_time THEN 1 ELSE 0 END) 
                    OVER (PARTITION BY id_time ORDER BY data ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS total_vitorias,
                SUM(CASE WHEN vencedor IS NOT NULL AND vencedor <> id_time THEN 1 ELSE 0 END) 
                    OVER (PARTITION BY id_time ORDER BY data ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS total_derrotas,
                SUM(empate) 
                    OVER (PARTITION BY id_time ORDER BY data ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS total_empates,

                -- Taxas gerais
                ROUND(100.0 * SUM(CASE WHEN vencedor = id_time THEN 1 ELSE 0 END) 
                    OVER (PARTITION BY id_time ORDER BY data ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) 
                    / NULLIF(COUNT(*) OVER (PARTITION BY id_time ORDER BY data ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 0), 2) AS taxa_vitoria,

                ROUND(100.0 * SUM(CASE WHEN vencedor IS NOT NULL AND vencedor <> id_time THEN 1 ELSE 0 END) 
                    OVER (PARTITION BY id_time ORDER BY data ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) 
                    / NULLIF(COUNT(*) OVER (PARTITION BY id_time ORDER BY data ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 0), 2) AS taxa_derrota,

                ROUND(100.0 * SUM(empate) 
                    OVER (PARTITION BY id_time ORDER BY data ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) 
                    / NULLIF(COUNT(*) OVER (PARTITION BY id_time ORDER BY data ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 0), 2) AS taxa_empate_geral,

                -- Taxas separadas por tipo de jogo
                ROUND(100.0 * SUM(CASE WHEN empate = 1 AND jogo_em_casa THEN 1 ELSE 0 END) 
                    OVER (PARTITION BY id_time ORDER BY data ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) 
                    / NULLIF(COUNT(*) OVER (PARTITION BY id_time ORDER BY data ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 0), 2) AS taxa_empate_casa,

                ROUND(100.0 * SUM(CASE WHEN empate = 1 AND NOT jogo_em_casa THEN 1 ELSE 0 END) 
                    OVER (PARTITION BY id_time ORDER BY data ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) 
                    / NULLIF(COUNT(*) OVER (PARTITION BY id_time ORDER BY data ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 0), 2) AS taxa_empate_fora

            FROM jogos_expandido
            )tb1

            where taxa_empate_geral > 60
            ', 
        NOW(), NOW(), NULL
      );
    `);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('filtrojogos', { nome: 'Ganhou 2 seguidas' }, {});
    }
};
