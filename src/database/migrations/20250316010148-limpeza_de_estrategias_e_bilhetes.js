'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('bilhetesodds', null, {});
    await queryInterface.bulkDelete('bilhetes', null, {});
    await queryInterface.bulkDelete('regras', null, {});
    await queryInterface.bulkDelete('estrategias', null, {});

    await queryInterface.sequelize.query(`
      INSERT INTO public.filtrojogos (
        nome, sql, "createdAt", "updatedAt", "deletedAt"
      ) 
      VALUES (
        'Ganhou 2 seguidas', 
        'WITH jogos_vitorias AS (
          SELECT 
            jogos.data,
            jogos.casa_id AS time_id,
            jogos.gols_casa,
            jogos.gols_fora,
            CASE 
              WHEN jogos.gols_casa > jogos.gols_fora THEN 1
              ELSE 0
            END AS vitoria
          FROM jogos
          WHERE jogos."deletedAt" IS NULL
          UNION ALL
          SELECT 
            jogos.data,
            jogos.fora_id AS time_id,
            jogos.gols_fora AS gols_casa,
            jogos.gols_casa AS gols_fora,
            CASE 
              WHEN jogos.gols_fora > jogos.gols_casa THEN 1
              ELSE 0
            END AS vitoria
          FROM jogos
          WHERE jogos."deletedAt" IS NULL
        ),
        jogos_numerados AS (
          SELECT 
            *,
            ROW_NUMBER() OVER (PARTITION BY time_id ORDER BY data DESC) AS rn
          FROM jogos_vitorias
        ),
        ultimos_tres_jogos AS (
          SELECT 
            time_id,
            SUM(vitoria) AS vitorias,
            COUNT(*) AS jogos_count
          FROM jogos_numerados
          WHERE rn <= 2
          GROUP BY time_id
          HAVING SUM(vitoria) = 2 AND COUNT(*) = 2
        )
        select time_id from ultimos_tres_jogos;', 
        NOW(), NOW(), NULL
      );
    `);
  }
};
