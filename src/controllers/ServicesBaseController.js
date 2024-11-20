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
            let totalAtualizado = 0;
            const regras = await regraServices.pegaTodosOsRegistros({ where: { 'regra': { [Op.ne]: null } } });

            if (regras.length <= 0) throw new Error('Sem regras para validar!');

            for (const regra of regras) {
                const odds = await regra.getOdds({
                    where: {
                        status: null
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
            const endTime = new Date();
            const executionTime = formatMilliseconds(endTime - startTime);
            logTo(`Finalizado a validação de regras. Tempo de execução: ${executionTime}. Total de linhas atualizadas: ${totalAtualizado}.`);
        } catch (error) {
            logTo('Erro ao validar os regras:', error.message);
            console.error('Erro ao validar os regras:', error.message);
        }
    }

}

module.exports = ServicesBaseController;
