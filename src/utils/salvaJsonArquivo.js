const fs = require('fs');
const path = require('path');
const logTo = require('./logTo.js')

module.exports = (tipoRequisicao, page, data) => {
    const dirPath = path.join(__dirname, '../database/storage/jsons/');
    const filePath = path.join(dirPath, `${tipoRequisicao}_${page}.json`);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    logTo(`Arquivo salvo em: ${filePath}`,false, false);

}