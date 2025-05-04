require('dotenv').config();
const Controller = require('./Controller.js');
const RegravalidacoeServices = require('../services/RegravalidacoeServices.js');
const JogosServices = require('../services/JogoServices.js');
const logTo = require('../utils/logTo.js');
const { Op } = require('sequelize');
const { Odd } = require('../database/models');
const toDay = require('../utils/toDay.js');
const formatMilliseconds = require('../utils/formatMilliseconds.js');
const RequisicaopendenteServices = require('../services/RequisicaopendenteServices.js');
const RequestServices = require('../services/RequestServices.js');
const EstrategiaServices = require('../services/EstrategiaServices.js');
const BilheteServices = require('../services/BilheteServices.js');
const OddServices = require('../services/OddServices.js');
const PaiServices = require('../services/PaiServices.js');
const DashboardServices = require('../services/DashboardServices.js');

const { TELEGRAM_BOT_TOKEN } = process.env;

const regraServices = new RegravalidacoeServices();
const jogoServices = new JogosServices();
const requisicaopendenteServices = new RequisicaopendenteServices();
const requestServices = new RequestServices();
const bilheteServices = new BilheteServices();
const estrategiaServices = new EstrategiaServices();
const oddSevices = new OddServices();
const paiServices = new PaiServices();
const dashboardServices = new DashboardServices();

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
            const bilhetes = await bilheteServices.bilhetesPendenteStatus();

            if (bilhetes.length <= 0) logTo('Sem bilhetes para validar!');

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
                        }
                    }
                }

                // 👉 Verifica se o bot foi removido do grupo
                if (update.my_chat_member) {
                    const membro = update.my_chat_member;
                    const grupo = membro.chat;
                    const usuario = membro.new_chat_member?.user;

                    if (usuario?.username === 'BigBet_alert_bot') {
                        const novoStatus = membro.new_chat_member.status;
                        const antigoStatus = membro.old_chat_member.status;

                        // Se o novo status for "left" ou "kicked", o bot saiu ou foi removido
                        if (novoStatus === 'left' || novoStatus === 'kicked') {
                            const nomeGrupo = grupo.title;
                            const match = nomeGrupo.match(/#(\w{4})/);
                            if (match) {
                                const chaveGrupo = match[1];
                                const estrategia = await estrategiaServices.pegaUmRegistro({ where: { chave_grupo: chaveGrupo } });
                                if (estrategia) {
                                    try {
                                        await estrategia.update({ chat_id: null, link_grupo: null });
                                    } catch (error) {
                                        logTo('Erro ao atualizar estratégia:', error.message);
                                    }
                                    logTo(`⚠️ Bot removido do grupo ${nomeGrupo}. Campos da estratégia ${estrategia.nome} foram limpos.`);
                                }
                            }
                        }
                    }
                }
            }


            // Atualiza o offset para evitar processar as mesmas atualizações novamente
            if (process.env.NODE_ENV != 'development') {
                if (updates.length > 0) {
                    const lastUpdateId = updates[updates.length - 1].update_id;
                    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ offset: lastUpdateId + 1 })
                    });
                }
            }


            return ({ mensagem: 'Verificação de grupos concluída' });
        } catch (error) {
            console.error('Erro ao verificar grupos do bot:', error.message);
            if (error.message) {
                logTo('Erro ao verificar grupos do bot:', error.message);
            }
            return ({ erro: error.message });
        }
    }

    async enviaMensagensTelegram(req, res) {
    }

    async atualizaGraficos(req, res) {
        try {
            const estrategias = await estrategiaServices.pegaTodosOsRegistros();
            for (const estrategia of estrategias) {
                await estrategia.update({ grafico_json: null });
            }

            await dashboardServices.atualizaLucrativoOntem();

            return { mensagem: 'Gráficos atualizados com sucesso.' };
        } catch (error) {
            console.error('Erro ao atualizar gráficos:', error);
            return { erro: error.message };
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
