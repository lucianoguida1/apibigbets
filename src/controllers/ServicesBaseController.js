require('dotenv').config();
const Controller = require('./Controller.js');
const RegravalidacoeServices = require('../services/RegravalidacoeServices.js');
const JogosServices = require('../services/JogoServices.js');
const logTo = require('../utils/logTo.js');
const { Op } = require('sequelize');
const { Odd } = require('../database/models');
const formatMilliseconds = require('../utils/formatMilliseconds.js');

const regraServices = new RegravalidacoeServices();
const jogoServices = new JogosServices();

class ServicesBaseController extends Controller {

    async validaRegras() {
        try {
            const startTime = new Date();  // Marca o início da execução
            logTo('Iniciando validação de regras odd');

            const regras = await regraServices.pegaTodosOsRegistros({ 'regra': { [Op.ne]: null } });
            const idJogos = new Set();

            if (regras.length > 0) {
                // Processa as odds para todos os jogos em lote
                for (const regra of regras) {
                    const odds = await regra.getOdds();

                    // Adiciona os jogos relacionados às odds no Set
                    odds.forEach(odd => idJogos.add(odd.jogo_id));
                }

                const idJogosArray = [...idJogos];  // Converte o Set para array uma vez

                if (idJogosArray.length > 0) {
                    const jogos = await jogoServices.jogoEstruturadoIds(idJogosArray);

                    // Processar as regras e atualizar odds em lotes
                    for (const regra of regras) {
                        const oddsToUpdate = [];
                        const funcaoValidacao = new Function('jogo', regra.regra);  // Cria a função uma vez por regra

                        for (const jogo of jogos) {
                            const novoStatus = funcaoValidacao(jogo) ? true : false;

                            // Acumula as odds que precisam ser atualizadas
                            oddsToUpdate.push({
                                jogo_id: jogo.id,
                                regra_id: regra.id,
                                status: novoStatus
                            });

                            // Atualiza em lotes de, por exemplo, 100 registros
                            if (oddsToUpdate.length >= 100) {
                                await Odd.bulkCreate(oddsToUpdate, {
                                    updateOnDuplicate: ['status']  // Atualizar o campo status quando houver duplicata
                                });
                                oddsToUpdate.length = 0;  // Limpa o array após o lote ser processado
                            }
                        }

                        // Atualiza as odds restantes que não completaram o lote
                        if (oddsToUpdate.length > 0) {
                            await Odd.bulkCreate(oddsToUpdate, {
                                updateOnDuplicate: ['status']
                            });
                        }
                    }
                }
            }

            const endTime = new Date();  // Marca o fim da execução
            const executionTime = formatMilliseconds(endTime - startTime);
            logTo(`Finalizado a validação de regras. Tempo de execução: ${executionTime}.`);
        } catch (error) {
            logTo('Erro ao validar os regras:', error.message);
            console.error('Erro ao validar os regras:', error.message);
        }
    }
}

module.exports = ServicesBaseController;
