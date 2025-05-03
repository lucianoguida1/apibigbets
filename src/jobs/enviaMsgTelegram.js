const logTo = require("../utils/logTo");


module.exports = {
    key: 'EnviaMsgTelegram',
    options: {
        delay: 1000,
        attempts: 3,
    },
    async handle({ data }) {
        const { chatId, message } = data;
        logTo(`Enviando mensagem para o chat ${chatId}: ${message}`);
    },
};
