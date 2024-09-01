const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');

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

module.exports = (message) => {
    const date = new Date().toISOString().split('T')[0]; // Formato: YYYY-MM-DD
    const logFileName = `${date}.log`;
    const logFilePath = path.join(logsDir, logFileName);

    // Assegura que a pasta logs existe
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }

    // Adiciona a mensagem ao arquivo de log
    fs.appendFileSync(logFilePath, `${formatDateTime()} - ${message}\n`);
    console.log(message);
}