const Services = require('./Services.js');
const { sequelize } = require('../database/models');
const logTo = require('../utils/logTo.js');

class DashboardServices extends Services {
    constructor() {
        super('Dashboard');
    }

    async atualizaLucrativoOntem() {
        try {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const formattedDate = yesterday.toISOString().split('T')[0];

            const query = `
                SELECT 
                t.nome AS label,
                b.estrategia_id,
                ROUND(SUM(
                    CASE 
                    WHEN b.status_bilhete IS TRUE  THEN (b.odd - 1) * b.valor_aposta
                    WHEN b.status_bilhete IS FALSE THEN - b.valor_aposta
                    ELSE 0
                    END
                )::numeric, 2) AS value,
                COUNT(DISTINCT b.id) AS num_bilhetes,
                SUM(b.valor_aposta) AS total_apostado,
                b.data::DATE AS data
                FROM bilhetes b
                JOIN estrategias t ON t.id = b.estrategia_id AND t."deletedAt" IS NULL
                WHERE b."deletedAt" IS NULL
                AND EXISTS (
                    SELECT 1
                    FROM bilhetesodds bo
                    JOIN odds o  ON o.id = bo.odd_id   AND o."deletedAt" IS NULL
                    JOIN jogos j ON j.id = o.jogo_id   AND j."deletedAt" IS NULL
                    WHERE bo.bilhete_id = b.id
                    AND j.data::DATE = DATE '${formattedDate}' -- use formato ISO
                )
                GROUP BY t.nome, b.estrategia_id, b.data::DATE
                ORDER BY value DESC
                limit 5;
            `;
            const dados = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

            if (dados.length === 0) {
                logTo('DashboardServices: Nenhum dado encontrado para o lucro de ontem', true, true);
                return;
            }
            const dashL = await super.pegaUmRegistro({ where: { nome: 'lucroOntem' } });
            if (dashL) {
                dashL.dados_json = JSON.stringify(dados);
                await dashL.save();
            } else {
                await super.criaRegistro({ nome: 'lucroOntem', dados_json: JSON.stringify(dados) });
            }
        } catch (error) {
            console.error('Erro ao atualizar o lucro de ontem:', error.message);
            logTo('DashboardServices:' + error.message, true, true);
        }
    }
}

module.exports = DashboardServices;
