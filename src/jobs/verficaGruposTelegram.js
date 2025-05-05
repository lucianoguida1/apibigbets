const logTo = require("../utils/logTo.js");
const { TELEGRAM_BOT_TOKEN } = process.env;

const EstrategiaServices = require('../services/EstrategiaServices.js');
const estrategiaServices = new EstrategiaServices();


module.exports = {
    key: 'verficaGruposTelegram',
    options: {
        delay: 1000,
        attempts: 3,
    },
    async handle(job) {
        try {
            const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);
            const data = await response.json();
            if (!data.ok) {
                throw new Error('Erro ao buscar atualizações do Telegram');
            }

            const updates = data.result;
            for (const update of updates) {
                await job.progress(Math.round(((updates.indexOf(update) + 1) / updates.length) * 100));
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
            await job.progress(100);
        } catch (error) {
            console.error('Erro ao verificar grupos do bot:', error.message);
            if (error.message) {
                logTo('Erro ao verificar grupos do bot:', error.message);
            }
        }
    }
}