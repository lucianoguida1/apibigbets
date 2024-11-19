require('dotenv').config();

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');

// Cria o diretório recursivamente
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

function formatDateTime() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Mês é baseado em zero
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

module.exports = async (message, telegram = true, cons = true) => {
    const date = new Date().toISOString().split('T')[0]; // Formato: YYYY-MM-DD
    const logFileName = `${date}.log`;
    const logFilePath = path.join(logsDir, logFileName);

    // Assegura que a pasta logs existe
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Adiciona a mensagem ao arquivo de log
    fs.appendFileSync(logFilePath, `${formatDateTime()} - ${message}\n`);

    if (telegram && process.env.NODE_ENV != 'development') {
        const telegramToken = process.env.TELEGRAM_BOT_TOKEN; // Token do bot do Telegram
        const telegramChatId = process.env.TELEGRAM_CHAT_ID; // ID do chat do Telegram

        if (telegramToken && telegramChatId) {
            try {
                await axios.post(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
                    chat_id: telegramChatId,
                    text: message
                });
            } catch (error) {
                console.error('Erro ao enviar mensagem para o Telegram:', error.message);
            }
        } else {
            console.error('TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID não configurados no .env.');
        }
    }
}