const logTo = require("../utils/logTo");

const BilheteServices = require('../services/BilheteServices.js');
const bilheteServices = new BilheteServices();

module.exports = {
    key: 'validaBilhetes',
    options: {
        delay: 1000,
        attempts: 3,
    },
    async handle(job) {
        try {
            const bilhetes = await bilheteServices.bilhetesPendenteStatus();
            for (const bilhete of bilhetes) {
                let status = null;
                for (const odd of bilhete.Odds) {
                    const progress = Math.round((bilhete.Odds.indexOf(odd) + 1) / bilhete.Odds.length * 100);
                    await job.progress(progress);
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
            }
            await job.progress(100);
        } catch (error) {
            logTo('Erro ao validar os bilhetes:', error.message);
            console.error('Erro ao validar os bilhetes:', error.message);
        }
    }
}