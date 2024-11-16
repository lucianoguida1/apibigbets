require('dotenv').config();
const Controller = require('./Controller.js');
const RegravalidacoeServices = require('../services/RegravalidacoeServices.js');
const JogosServices = require('../services/JogoServices.js');
const logTo = require('../utils/logTo.js');
const { Op } = require('sequelize');
const { Odd } = require('../database/models');
const formatMilliseconds = require('../utils/formatMilliseconds.js');
const RequisicaopendenteServices = require('../services/RequisicaopendenteServices.js');
const RequestServices = require('../services/RequestServices.js');
const EstrategiaServices = require('../services/EstrategiaServices.js');
const BilheteServices = require('../services/BilheteServices.js');
const toDay = require('../utils/toDay.js');

const regraServices = new RegravalidacoeServices();
const jogoServices = new JogosServices();
const requisicaopendenteServices = new RequisicaopendenteServices();
const requestServices = new RequestServices();
const bilheteServices = new BilheteServices();
const estrategiaServices = new EstrategiaServices();

class ServicesBaseController extends Controller {
    async statusBasico(req, res) {
        try {
            let dados = {};
            dados.requisicaoPendente = await requisicaopendenteServices.pegaTodosOsRegistros();
            dados.RequisicaoSports = await requestServices.pegaRegistrosDeHoje();
            dados.jogosHoje = await jogoServices.pegaEContaRegistros({ where: { 'data': toDay() } });
            return res.status(200).json(dados);
        } catch (error) {
            console.log(error)
            return res.status(500).json({ erro: error.message });
        }
    }

    async deletaJogosAntigos() {
        const doisDiasAtras = new Date();
        doisDiasAtras.setDate(doisDiasAtras.getDate() - 1);
        const dataFormatada = doisDiasAtras.toISOString().split('T')[0];

        const quantidadeDeletados = await jogoServices.excluiVarios({
            gols_casa: null,
            data: {
                [Op.lt]: dataFormatada
            }
        });
        console.log(dataFormatada);
        logTo(`Quantidade de jogos deletados: ${quantidadeDeletados}`, true);
    }

    async executarEstrategias(req, res) {
        try {
            logTo(' - Executando estratégias - ', true);
            const estrategias = await estrategiaServices.pegaTodosOsRegistros();
            for (const est of estrategias) {
                await bilheteServices.montaBilhetes(est, true);
                await estrategiaServices.geraEstistica(est)
            }
            logTo('Executado estratégias', true);
        } catch (error) {
            logTo('Erro ao executar estratégia: ' + error.message, true);
        }
    }

    async validaRegras() {
        try {
            const startTime = new Date();  // Marca o início da execução
            logTo('Iniciando validação de regras odd');

            const regras = await regraServices.pegaTodosOsRegistros({ where: { 'regra': { [Op.ne]: null } } });
            const idJogos = new Set();
            const jogoOddsMap = new Map(); // Mapeia os jogos para suas odds
            let totalAtualizado = 0;  // Variável para acumular o número de linhas atualizadas

            if (regras.length > 0) {
                // Data de ontem até hoje
                const startOfYesterday = new Date();
                startOfYesterday.setDate(startOfYesterday.getDate() - 50);
                startOfYesterday.setHours(0, 0, 0, 0);

                const endOfToday = new Date();
                endOfToday.setHours(23, 59, 59, 999);

                // Processa as odds para todos os jogos em lote
                for (const regra of regras) {
                    // Adiciona filtro de createdAt entre ontem e hoje
                    const odds = await regra.getOdds({
                        where: {
                            createdAt: {
                                [Op.between]: [startOfYesterday, endOfToday]
                            }
                        }
                    });

                    // Adiciona os jogos relacionados às odds no Set e também as odds no Map
                    odds.forEach(odd => {
                        idJogos.add(odd.jogo_id);
                        if (!jogoOddsMap.has(odd.jogo_id)) {
                            jogoOddsMap.set(odd.jogo_id, []);
                        }
                        jogoOddsMap.get(odd.jogo_id).push(odd); // Mapeia o jogo com sua lista de odds
                    });
                }

                const idJogosArray = [...idJogos];  // Converte o Set para array uma vez

                if (idJogosArray.length > 0) {
                    const jogos = await jogoServices.jogoEstruturadoIds(idJogosArray, { gols_casa: { [Op.ne]: null } });

                    // Processar as regras e atualizar odds em lotes
                    for (const regra of regras) {
                        const oddsToUpdate = [];
                        const funcaoValidacao = new Function('jogo', regra.regra);  // Cria a função uma vez por regra

                        for (const jogo of jogos) {
                            const novoStatus = funcaoValidacao(jogo) ? true : false;

                            // Verifica se há odds associadas a este jogo e a mesma regra
                            const oddsAssociadas = jogoOddsMap.get(jogo.id).filter(odd => odd.regra_id === regra.id);
                            if (oddsAssociadas && oddsAssociadas.length > 0) {
                                for (const odd of oddsAssociadas) {
                                    // Acumula as odds que precisam ser atualizadas, agora com o odd.id
                                    oddsToUpdate.push({
                                        id: odd.id, // ID da odd
                                        jogo_id: jogo.id,
                                        regra_id: regra.id,
                                        status: novoStatus
                                    });
                                }
                            }

                            // Atualiza em lotes de, por exemplo, 100 registros
                            if (oddsToUpdate.length >= 100) {
                                const result = await Odd.bulkCreate(oddsToUpdate, {
                                    updateOnDuplicate: ['status']  // Atualizar o campo status quando houver duplicata
                                });
                                totalAtualizado += result.length;  // Acumula o número de linhas atualizadas
                                oddsToUpdate.length = 0;  // Limpa o array após o lote ser processado
                            }
                        }

                        // Atualiza as odds restantes que não completaram o lote
                        if (oddsToUpdate.length > 0) {
                            const result = await Odd.bulkCreate(oddsToUpdate, {
                                updateOnDuplicate: ['status']
                            });
                            totalAtualizado += result.length;  // Acumula o número de linhas atualizadas
                        }
                    }
                }
            }

            const endTime = new Date();  // Marca o fim da execução
            const executionTime = formatMilliseconds(endTime - startTime);
            logTo(`Finalizado a validação de regras. Tempo de execução: ${executionTime}. Total de linhas atualizadas: ${totalAtualizado}.`);
        } catch (error) {
            logTo('Erro ao validar os regras:', error.message);
            console.error('Erro ao validar os regras:', error.message);
        }
    }


}

module.exports = ServicesBaseController;
