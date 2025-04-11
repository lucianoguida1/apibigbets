require('dotenv').config();
const Controller = require('./Controller.js');
const RegravalidacoeServices = require('../services/RegravalidacoeServices.js');
const JogosServices = require('../services/JogoServices.js');
const logTo = require('../utils/logTo.js');
const { Op, where } = require('sequelize');
const { Odd, Bilhete } = require('../database/models');
const formatMilliseconds = require('../utils/formatMilliseconds.js');
const RequisicaopendenteServices = require('../services/RequisicaopendenteServices.js');
const RequestServices = require('../services/RequestServices.js');
const EstrategiaServices = require('../services/EstrategiaServices.js');
const BilheteServices = require('../services/BilheteServices.js');
const OddServices = require('../services/OddServices.js');
const toDay = require('../utils/toDay.js');
const PaiServices = require('../services/PaiServices.js');
const { TELEGRAM_BOT_TOKEN } = process.env;

const regraServices = new RegravalidacoeServices();
const jogoServices = new JogosServices();
const requisicaopendenteServices = new RequisicaopendenteServices();
const requestServices = new RequestServices();
const bilheteServices = new BilheteServices();
const estrategiaServices = new EstrategiaServices();
const paiServices = new PaiServices();
const oddSevices = new OddServices();

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
            logTo(' - Executando estratégias - ', true, true);
            const estrategias = await estrategiaServices.pegaTodosOsRegistros();
            for (const est of estrategias) {
                try {
                    await bilheteServices.montaBilhetes(est, true);
                    await estrategiaServices.geraEstistica(est);
                } catch (error) {
                    // não faz nada só para n parar o loop
                }
            }
            logTo('Finalizado a execução estratégias', true);
        } catch (error) {
            logTo('Erro ao executar estratégia: ' + error.message, true, true);
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
                const odds = await oddSevices.pegaTodosOsRegistros({
                    where: {
                        regra_id: regra.id,
                        [Op.or]: [
                            { status: null },
                            { createdAt: { [Op.between]: [toDay(-1), toDay()] } },
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
            const endTime = new Date();
            const executionTime = formatMilliseconds(endTime - startTime);
            logTo(`Finalizado a validação de regras. Tempo de execução: ${executionTime}. Total de linhas atualizadas: ${totalAtualizado}.`);
        } catch (error) {
            logTo('Erro ao validar os regras:', error.message);
            console.error('Erro ao validar os regras:', error);
        }
    }

    async validaBilhetes() {
        try {
            const startTime = new Date();  // Marca o início da execução
            logTo('Iniciando validação bilhetes');
            let totalAtualizado = 0;
            const bilhetes = await bilheteServices.pegaTodosOsRegistros({
                where: {
                    status_bilhete: null,
                },
                include: [
                    {
                        model: Odd,
                        required: true,
                        where: {
                            status: { [Op.ne]: null }
                        },
                    }
                ]
            });

            for (const bilhete of bilhetes) {
                let status = null;
                for (const odd of bilhete.Odds) {
                    if (odd.status === null) {
                        status = null;
                        break;
                    } else if (odd.status === false) {
                        status = false;
                        break;
                    } else {
                        status = true;
                    }
                }
                await bilhete.update({ status_bilhete: status });
                totalAtualizado++;
            }

            const endTime = new Date();
            const executionTime = formatMilliseconds(endTime - startTime);
            logTo(`Finalizado a validação de bilhetes. Tempo de execução: ${executionTime}. Total de linhas atualizadas: ${totalAtualizado}.`);
        } catch (error) {
            logTo('Erro ao validar os bilhetes:', error.message);
            console.error('Erro ao validar os bilhetes:', error.message);
        }
    }

    async geraEstisticaGeral() {
        try {
            const pais = await paiServices.paisCompleto();
            for (const pai of pais) {
                for (const liga of pai.Ligas) {
                    for (const temporada of liga.Temporadas) {
                        for (const jogo of temporada.Jogos) {
                            const casa = await jogo.getCasa();
                            const fora = await jogo.getFora();
                            temporada.dados_json = updateDadosJson(temporada.dados_json, 'num_jogos');
                            liga.dados_json = updateDadosJson(liga.dados_json, 'num_jogos');
                            pai.dados_json = updateDadosJson(pai.dados_json, 'num_jogos');
                            fora.dados_json = updateDadosJson(fora.dados_json, 'num_jogos');
                            casa.dados_json = updateDadosJson(casa.dados_json, 'num_jogos');
                            for (const odd of jogo.Odds) {
                                if (odd.regra_id == 1 && odd.status) {
                                    // valida ganhadores [Casa, Casa ou Empate, Casa ou Fora]
                                    temporada.dados_json = updateDadosJson(temporada.dados_json, ['casa_ganha', 'casa_ou_empate', 'casa_ou_fora']);
                                    liga.dados_json = updateDadosJson(liga.dados_json, ['casa_ganha', 'casa_ou_empate', 'casa_ou_fora']);
                                    pai.dados_json = updateDadosJson(pai.dados_json, ['casa_ganha', 'casa_ou_empate', 'casa_ou_fora']);
                                    casa.dados_json = updateDadosJson(casa.dados_json, ['casa_ganha', 'casa_ou_empate', 'casa_ou_fora']);
                                    fora.dados_json = updateDadosJson(fora.dados_json, ['jogos_perdidos', 'casa_ou_fora']);
                                }
                                if (odd.regra_id == 2 && odd.status) {
                                    // valida jogos empatados [jogos empate, Casa ou Empate, fora ou empate]
                                    temporada.dados_json = updateDadosJson(temporada.dados_json, ['jogos_empatados', 'casa_ou_empate', 'fora_ou_empate']);
                                    liga.dados_json = updateDadosJson(liga.dados_json, ['jogos_empatados', 'casa_ou_empate', 'fora_ou_empate']);
                                    pai.dados_json = updateDadosJson(pai.dados_json, ['jogos_empatados', 'casa_ou_empate', 'fora_ou_empate']);
                                    casa.dados_json = updateDadosJson(casa.dados_json, ['jogos_empatados', 'casa_ou_empate']);
                                    fora.dados_json = updateDadosJson(fora.dados_json, ['jogos_empatados', 'fora_ou_empate']);
                                }
                                if (odd.regra_id == 3 && odd.status) {
                                    // valida ganhadores [Fora, Fora ou Empate, Casa ou Fora]
                                    temporada.dados_json = updateDadosJson(temporada.dados_json, ['fora_ganha', 'fora_ou_empate', 'casa_ou_fora']);
                                    liga.dados_json = updateDadosJson(liga.dados_json, ['fora_ganha', 'fora_ou_empate', 'casa_ou_fora']);
                                    pai.dados_json = updateDadosJson(pai.dados_json, ['fora_ganha', 'fora_ou_empate', 'casa_ou_fora']);
                                    fora.dados_json = updateDadosJson(fora.dados_json, ['fora_ganha', 'fora_ou_empate', 'casa_ou_fora']);
                                    casa.dados_json = updateDadosJson(casa.dados_json, ['jogos_perdidos', 'casa_ou_fora']);
                                }
                            }// fim do loop de Odds
                            await casa.save();
                            await fora.save();
                        }/// fim do loop Jogos
                        await temporada.save();
                    }// fim do loop de Temporada
                    await liga.save();
                }//fim do loop de Ligas
                await pai.save();
            }

            logTo(`Total de pais processados: ${pais.length}`);
        } catch (error) {
            throw new Error('Erro ao gerar estatísticas gerais: ' + error.message);
        }
    }

    // envia a mensagem no grupo do telegram
    async verificaGrupoBot(req, res) {
        try {
            const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);
            const data = await response.json();
            if (!data.ok) {
                throw new Error('Erro ao buscar atualizações do Telegram');
            }

            const updates = data.result;
            for (const update of updates) {
                if (update.message && update.message.chat && update.message.chat.type === 'supergroup') {
                    const grupo = update.message.chat;
                    const nomeGrupo = grupo.title;
                    const match = nomeGrupo.match(/#(\w{4})/);
                    if (match) {
                        const chaveGrupo = match[1];
                        const estrategia = await estrategiaServices.pegaUmRegistro({ where: { chave_grupo: chaveGrupo } });
                        if (estrategia) {
                            // Busca o link do grupo
                            const groupLinkResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/exportChatInviteLink`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ chat_id: grupo.id })
                            });
                            const groupLinkData = await groupLinkResponse.json();

                            if (!groupLinkData.ok) {
                                await estrategia.update({ chat_id: grupo.id });
                                continue; // Não continua com o restante do código se não encontrar o link do grupo
                            }

                            await estrategia.update({ chat_id: grupo.id, link_grupo: groupLinkData.result });
                            logTo(`Atualizado chat_id da estratégia ${estrategia.nome} com o id do grupo ${grupo.id}`);

                            // Atualiza o offset para evitar processar as mesmas atualizações novamente
                            if (process.env.NODE_ENV !== 'development') {
                                const lastUpdateId = updates[updates.length - 1].update_id;
                                await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ offset: lastUpdateId + 1 })
                                });
                            }
                        }
                    }
                }
            }


            return ({ mensagem: 'Verificação de grupos concluída' });
        } catch (error) {
            if (error.message) {
                logTo('Erro ao verificar grupos do bot:', error.message);
            }
            return ({ erro: error.message });
        }
    }

    async enviaMensagensTelegram(req, res) {
        try {
            const { count, bilhetes } = await bilheteServices.getBilhetesFromMsg({
                where: {
                    alert: null
                },
                order: [['id', 'DESC']]
            }, {
                where: { chat_id: { [Op.ne]: null } }
            });

            if (bilhetes.length === 0) {
                return ({ mensagem: 'Nenhum bilhete para enviar mensagem' });
            }
            const mensagems = [];
            let bilhetesId = [];

            for (const bilhete of bilhetes) {
                if (mensagems[bilhete.Estrategium.chat_id] === undefined) {
                    mensagems[bilhete.Estrategium.chat_id] = {
                        msg: `Temos ${count} bilhetes para você conferir\n\nEstratégia: ${bilhete.Estrategium.nome} \n\n`,
                        bilehtes: []
                    }
                    mensagems[bilhete.Estrategium.chat_id].bilehtes = bilhete.id;
                } else {
                    if (mensagems[bilhete.Estrategium.chat_id].msg.length > 3000) {
                        break;
                    }
                    mensagems[bilhete.Estrategium.chat_id].bilehtes += `, ${bilhete.id}`;
                }
                mensagems[bilhete.Estrategium.chat_id].msg += `Bilhete: ${bilhete.id}\n`;
                mensagems[bilhete.Estrategium.chat_id].msg += `Odd: ${parseFloat(bilhete.odd).toFixed(2)}\n\n`;
                mensagems[bilhete.Estrategium.chat_id].msg += `Jogo(s):\n`;
                for (const odd of bilhete.Odds) {
                    mensagems[bilhete.Estrategium.chat_id].msg += `- ${odd.Jogo.casa.nome} x ${odd.Jogo.fora.nome}\n`;
                    const dataHora = new Date(odd.Jogo.datahora);
                    const dataFormatada = dataHora.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: '2-digit' });
                    mensagems[bilhete.Estrategium.chat_id].msg += `- Data: ${dataFormatada}\n`;
                    mensagems[bilhete.Estrategium.chat_id].msg += `- Odd: ${parseFloat(odd.odd).toFixed(2)}\n`;
                    mensagems[bilhete.Estrategium.chat_id].msg += `- ${odd.Tipoapostum.nome} - ${odd.regra.nome}\n\n`;
                }
                mensagems[bilhete.Estrategium.chat_id].msg += `- # - # - # - # - # - # - # - # -\n\n`;
                bilhetesId.push(bilhete.id);
            }

            for (const chatId in mensagems) {
                let mensagem = mensagems[chatId].msg;
                mensagem += `Todas as odds são com base na casa de apota BET365. \n\n`;
                mensagem += `Clique no link: https://www.bet365.com/pt/ \n\n`;

                const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: process.env.NODE_ENV !== 'development' ? chatId : process.env.TELEGRAM_CHAT_ID,
                        text: mensagem
                    })
                });

                const data = await response.json();
                if (data.ok) {
                    await bilheteServices.atualizaRegistro({ alert: true }, {
                        id: {
                            [Op.in]: bilhetesId
                        }
                    })
                } else {
                    logTo(`Erro ao enviar mensagem para o grupo ${chatId}: ${data.description}`);
                }
                await new Promise(resolve => setTimeout(resolve, 3000)); // Aguarda 300ms entre cada mensagem
            }

            return ({ mensagem: 'Mensagens enviadas' });
        } catch (error) {
            console.error('Erro ao enviar mensagens:', error.message);
        }
    }
}

function updateDadosJson(dadosJson, chaves) {
    const json = { ...dadosJson }; // Garante que não mutamos o objeto original
    if (Array.isArray(chaves)) {
        // Caso `chaves` seja um array, itera sobre ele
        chaves.forEach(chave => {
            json[chave] = (json[chave] || 0) + 1; // Incrementa ou inicializa com 1
        });
    } else {
        // Caso `chaves` seja uma string (chave única)
        json[chaves] = (json[chaves] || 0) + 1;
    }
    return json;
}

module.exports = ServicesBaseController;
