
const EstrategiaServices = require('../services/EstrategiaServices.js');
const BilheteServices = require('../services/BilheteServices.js');
const bilheteServices = new BilheteServices();
const estrategiaServices = new EstrategiaServices();
const logTo = require("../utils/logTo");

module.exports = {
    key: 'executaEstrategias',
    options: {
        delay: 1000,
        attempts: 3,
    },
    async handle(job) {
        try {
            const estrategias = await estrategiaServices.pegaTodosOsRegistros();
            for (const est of estrategias) {
                try {
                    await job.progress(1);
                    await bilheteServices.montaBilhetes(est, true);
                    await job.progress(50);
                    await estrategiaServices.geraEstistica(est);
                    await job.progress(100);
                } catch (error) {
                    // não faz nada só para n parar o loop
                }
            }
        } catch (error) {
            logTo('Erro ao executar estratégia: ' + error.message, true, true);
        }
    }
}
