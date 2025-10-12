const logTo = require("../utils/logTo");
const toDay = require('../utils/toDay.js');
const RegravalidacoeServices = require('../services/RegravalidacoeServices.js');
const regraServices = new RegravalidacoeServices();
const JogosServices = require('../services/JogoServices.js');
const jogoServices = new JogosServices();
const OddServices = require('../services/OddServices.js');
const oddSevices = new OddServices();
const { Op } = require('sequelize');
const { Odd } = require('../database/models');

module.exports = {
    key: 'validaOdds',
    options: {
        delay: 1000,
        attempts: 3,
    },
    async handle(job) {
        try {
            let totalAtualizado = 0;
            const regras = await regraServices.pegaTodosOsRegistros({ where: { 'regra': { [Op.ne]: null } } });
            if (regras.length <= 0) throw new Error('Sem regras para validar!');
            for (const regra of regras) {
                const progress = Math.round((regras.indexOf(regra) + 1) / regras.length * 100);
                await job.progress(progress);
                const odds = await oddSevices.pegaTodosOsRegistros({
                    where: {
                        regra_id: regra.id,
                        [Op.or]: [
                            { status: null },
                            { createdAt: { [Op.between]: [toDay(-3), toDay()] } },
                        ]
                    }
                });

                const jogoIds = odds.map(odd => odd.jogo_id);
                const jogos = await jogoServices.jogoEstruturadoIds(jogoIds, { gols_casa: { [Op.ne]: null } });

                const oddsToUpdate = [];
                if (jogos.length > 0) {
                    const funcaoValidacao = new Function('jogo', regra.regra);
                    for (const jogo of jogos) {
                        const novoStatus = await funcaoValidacao(jogo) ? true : false;
                        const oddDoJogo = odds.find(odd => odd.jogo_id === jogo.id && odd.regra_id === regra.id);
                        if (oddDoJogo) {
                            oddsToUpdate.push({
                                id: oddDoJogo.id,
                                jogo_id: jogo.id,
                                regra_id: regra.id,
                                status: novoStatus
                            });
                        }
                    }
                    const result = await Odd.bulkCreate(oddsToUpdate, {
                        updateOnDuplicate: ['status']
                    });
                    totalAtualizado += result.length;
                }
            }
            await job.progress(100);
        } catch (error) {
            logTo('Erro ao validar os regras:', error.message);
            console.error('Erro ao validar os regras:', error);
        }
    }
};