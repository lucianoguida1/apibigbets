const logTo = require("../utils/logTo");
const BilheteServices = require('../services/BilheteServices.js');
const bilheteServices = new BilheteServices();
const { Op } = require('sequelize');



module.exports = {
    key: 'enviaMsgTelegram',
    options: {
        delay: 1000,
        attempts: 3,
    },
    async handle({ data }) {
        try {
            const { count, bilhetes } = await bilheteServices.getBilhetesFromMsg({
                where: {
                    alert: null,
                    status_bilhete: null,
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
                const progress = Math.floor((bilhetes.indexOf(bilhete) + 1) / bilhetes.length * 100);
                await job.progress(progress);
                if (mensagems[bilhete.Estrategium.chat_id] === undefined) {
                    mensagems[bilhete.Estrategium.chat_id] = {
                        msg: `Temos novos bilhetes para você conferir\n\nEstratégia: ${bilhete.Estrategium.nome} \n\n`,
                        bilehtes: [],
                        estrategia: bilhete.Estrategium,
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
                mensagem += `Clique no link: https://bigbets.pro/estrategia/${mensagems[chatId].estrategia.id} \n\n`;

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
                    logTo(`Erro ao enviar mensagem para o grupos ${chatId}: ${data.description}`);

                    // 👉 Verifica se o erro indica que o bot foi removido/bloqueado
                    const errosCriticos = [
                        'bot was kicked',
                        'bot was blocked',
                        'user is deactivated',
                        'not enough rights',
                        'have no rights',
                        'CHAT_WRITE_FORBIDDEN'
                    ];

                    if (errosCriticos.some(erro => data.description.toLowerCase().includes(erro))) {
                        const estrategiaId = mensagems[chatId]?.estrategia?.id;
                        if (estrategiaId) {
                            const estrategia = await estrategiaServices.pegaUmRegistro({ where: { id: estrategiaId } });
                            if (estrategia) {
                                await estrategia.update({ chat_id: null, link_grupo: null });
                                logTo(`⚠️ Campos resetados da estratégia ${estrategia.nome} pois o bot foi removido do grupo ${chatId}.`);
                            }
                        }
                    }
                }
                await new Promise(resolve => setTimeout(resolve, 3000)); // Aguarda 300ms entre cada mensagem
            }

            return ({ mensagem: 'Mensagens enviadas' });
        } catch (error) {
            console.error('Erro ao enviar mensagens:', error.message);
        }
    },
};
