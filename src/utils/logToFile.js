const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');

module.exports = (message) => {
    const date = new Date().toISOString().split('T')[0]; // Formato: YYYY-MM-DD
    const logFileName = `${date}.log`;
    const logFilePath = path.join(logsDir, logFileName);

    // Assegura que a pasta logs existe
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }

    // Adiciona a mensagem ao arquivo de log
    fs.appendFileSync(logFilePath, `${new Date().toISOString()} - ${message}\n`);
    console.log(message);
}