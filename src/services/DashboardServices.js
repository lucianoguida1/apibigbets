const Services = require('./Services.js');
const { Op, where } = require('sequelize');
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
                t.nome as estrategia,
                b.estrategia_id,
                ROUND(SUM(
                    CASE 
                    WHEN status_bilhete IS NOT NULL AND status_bilhete = true THEN (b.odd - 1)
                    WHEN status_bilhete IS NOT NULL AND status_bilhete = false THEN -1
                    ELSE 0 
                    END
                )::numeric, 2) AS lucro,
                COUNT(*) AS num_bilhetes,
                b.data::DATE
                FROM bilhetes b
                INNER JOIN estrategias t ON b.estrategia_id = t.id
                INNER JOIN bilhetesodds bo ON bo.bilhete_id = b.id
                INNER JOIN odds o ON bo.odd_id = o.id
                INNER JOIN jogos j ON j.id = o.jogo_id
                where j.data::DATE = '${formattedDate}'
                group by t.nome,b.estrategia_id,b.data
                order by lucro desc
                limit 5
            `;
            const dados = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

            if (dados.length === 0) {
                logTo('DashboardServices', 'Nenhum dado encontrado para o lucro de ontem', 'info', 'DashboardServices.js', 'atualizaLucrativoOntem');
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
            logTo('Erro ao atualizar dahsboard', error.message, 'error', 'DashboardServices.js', 'atualizaLucrativoOntem');
        }
    }
}

module.exports = DashboardServices;