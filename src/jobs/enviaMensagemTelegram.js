// jobs/enviaMensagemTelegram.js
/* eslint-disable no-console */
require('dotenv').config();

const logTo = require("../utils/logTo");
const EstrategiaServices = require('../services/EstrategiaServices.js');
const estrategiaServices = new EstrategiaServices();


// Fallback para Node < 18
let _fetch = globalThis.fetch;
if (!_fetch) {
    _fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
}

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_GRUPO } = process.env;

if (!TELEGRAM_BOT_TOKEN) {
    const msg = 'TELEGRAM_BOT_TOKEN ausente no .env';
    logTo(msg, true, true);
    throw new Error(msg);
}

const TG_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const MAX_LEN = 4096;
const DEFAULT_TIMEOUT_MS = 15000;

/** --------- DETECÇÃO DE REMOÇÃO / BLOQUEIO --------- **/
class BotRemovedError extends Error {
    constructor(message, { chatId, status, bodyText, json }) {
        super(message);
        this.name = 'BotRemovedError';
        this.chatId = chatId;
        this.status = status;
        this.bodyText = bodyText;
        this.json = json;
    }
}

/**
 * Heurística para detectar quando o bot foi removido / não é membro.
 * Exemplos (Telegram):
 *  - 403 Forbidden: bot was kicked from the supergroup
 *  - 403 Forbidden: bot was blocked by the user
 *  - 403 Forbidden: bot is not a member of the chat
 *  - 400 Bad Request: chat not found
 */
function isBotRemovedError({ status, json, bodyText }) {
    const text = (json?.description || bodyText || '').toLowerCase();

    if (status === 403) {
        if (text.includes('bot was kicked')
            || text.includes('bot was blocked')
            || text.includes('bot is not a member')
            || text.includes('have no rights to send a message')) {
            return { removed: true, reason: json?.description || 'Forbidden (bot removed/blocked)' };
        }
    }

    if (status === 400 && text.includes('chat not found')) {
        return { removed: true, reason: json?.description || 'Bad Request (chat not found)' };
    }

    return { removed: false, reason: null };
}

/**
 * Hook para ação quando o bot foi removido/não é membro.
 * >>> IMPLEMENTE AQUI <<< (ex: marcar chat como inativo na base, limpar assinaturas, etc.)
 */
async function onBotRemoved(chatId, context) {
    // TODO: implemente sua ação. Exemplos:
    // - await Chats.markInactive(chatId, context.reason)
    // - await Filas.cancelarAlertas(chatId)
    // - await NotificarADM(`Bot removido do chat ${chatId}: ${context.reason}`)
    const estrategia = await estrategiaServices.pegaUmRegistro({ where: { chat_id: chatId } });
    if (estrategia) {
        await estrategia.update({ chat_id: null, link_grupo: null });
        logTo(`⚠️ Campos resetados da estratégia ${estrategia.nome} pois o bot foi removido do grupo ${chatId}.`);
    }else{
        logTo(`⚠️ O bot foi removido do chat ${chatId}, mas nenhuma estratégia encontrada com esse chat_id.`);
    }
}

/** --------- UTIL --------- **/
function normalizeChatId(chatId) {
    if (chatId === undefined || chatId === null || chatId === '') {
        if(process.env.NODE_ENV == 'development'){
            return process.env.TELEGRAM_CHAT_LOG;
        }
        return TELEGRAM_CHAT_GRUPO ? TELEGRAM_CHAT_GRUPO : -100232929834;
    }
    if (typeof chatId === 'string' && chatId !== '' && !Number.isNaN(Number(chatId)) && !chatId.startsWith('-100')) {
        return Number(chatId);
    }
    return chatId;
}

function chunkMessage(text) {
    if (typeof text !== 'string') text = String(text ?? '');
    if (text.length <= MAX_LEN) return [text];
    const parts = [];
    for (let i = 0; i < text.length; i += MAX_LEN) parts.push(text.slice(i, i + MAX_LEN));
    return parts;
}

/** --------- ENVIO --------- **/
async function sendTelegramChunk({ chatId, text, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS }) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeoutMs);

    try {
        const res = await _fetch(`${TG_API}/sendMessage`, {
            method: 'POST',
            signal: ac.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                // parse_mode: 'MarkdownV2',
                disable_web_page_preview: true,
                ...options,
            }),
        });

        let bodyText = '';
        let json;
        try {
            bodyText = await res.text();
            json = bodyText ? JSON.parse(bodyText) : null;
        } catch {
            // mantém bodyText bruto
        }

        if (!res.ok) {
            // 429 rate limit → respeita retry_after
            if (res.status === 429 && json?.parameters?.retry_after) {
                const retryAfter = Number(json.parameters.retry_after) * 1000;
                logTo(`[TG] 429 Too Many Requests. Aguardando ${retryAfter}ms...`, true, false);
                await new Promise(r => setTimeout(r, retryAfter));
            }

            // Detecta remoção/bloqueio
            const { removed, reason } = isBotRemovedError({ status: res.status, json, bodyText });
            if (removed) {
                throw new BotRemovedError(`[TG] Bot removido/bloqueado: ${reason}`, {
                    chatId,
                    status: res.status,
                    bodyText,
                    json
                });
            }

            const snippet = (bodyText || '').slice(0, 500);
            throw new Error(`[TG] HTTP ${res.status} ${res.statusText} Body: ${snippet}`);
        }

        if (json && json.ok === false) {
            // Mesmo em 200/OK, a API pode retornar ok:false
            const desc = json.description || 'Erro desconhecido do Telegram';
            const { removed, reason } = isBotRemovedError({ status: 200, json, bodyText: desc });
            if (removed) {
                throw new BotRemovedError(`[TG] Bot removido/bloqueado: ${reason}`, {
                    chatId,
                    status: 200,
                    bodyText: desc,
                    json
                });
            }
            throw new Error(`[TG] API ok:false - ${desc}`);
        }

        return json;
    } finally {
        clearTimeout(t);
    }
}

async function sendTelegramSafely({ chatId, message, options }) {
    const parts = chunkMessage(message);
    for (let idx = 0; idx < parts.length; idx++) {
        const part = parts[idx];
        await sendTelegramChunk({ chatId, text: part, options });
        if (idx < parts.length - 1) {
            await new Promise(r => setTimeout(r, 150));
        }
    }
}

/** --------- JOB BULL --------- **/
module.exports = {
    key: 'enviaMensagemTelegram',
    options: {
        delay: 0,
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        // removeOnComplete: true,
        removeOnFail: false,
    },
    /**
     * job.data:
     * {
     *   chatId?: number|string,
     *   message: string,
     *   // options?: { parse_mode, disable_web_page_preview, reply_markup, ... }
     * }
     */
    async handle(job) {
        const startedAt = Date.now();
        try {
            let { chatId, message, options } = job.data || {};
            if (!message || String(message).trim() === '') {
                throw new Error('Mensagem não pode ser vazia');
            }

            chatId = normalizeChatId(chatId);

            await sendTelegramSafely({ chatId, message, options });

            return { ok: true, durationMs: Date.now() - startedAt };
        } catch (error) {
            // CASO 1: bot removido/bloqueado → trata e NÃO relança (evita retentativas)
            if (error instanceof BotRemovedError) {
                const context = {
                    reason: error.message,
                    status: error.status,
                    chatId: error.chatId,
                    raw: error.json || error.bodyText,
                    startedAt,
                };

                try {
                    await onBotRemoved(error.chatId, context); // <<< implemente sua ação
                } catch (hookErr) {
                    logTo(`[TG] Falha ao executar onBotRemoved: ${hookErr?.message || hookErr}`, true, true);
                }

                // Retorna payload útil para auditoria/monitoramentos
                return {
                    ok: false,
                    removed: true,
                    reason: context.reason,
                    chatId: error.chatId,
                    status: error.status,
                    durationMs: Date.now() - startedAt
                };
            }

            // CASO 2: outros erros → mantém comportamento (relança para retentativas do Bull)
            logTo('Error sending message to Telegram: ' + (error?.message || String(error)), true, true);
            throw error;
        }
    },
};
