const EstrategiaServices = require('../services/EstrategiaServices.js');
const estrategiaServices = new EstrategiaServices();
const DashboardServices = require('../services/DashboardServices.js');
const dashboardServices = new DashboardServices();

module.exports = {
    key: 'atualizaGraficos',
    options: {
        delay: 1000,
        attempts: 3,
    },
    async handle(job) {
        try {
            const estrategias = await estrategiaServices.pegaTodosOsRegistros();
            await job.progress(1);
            for (const estrategia of estrategias) {
                await estrategia.update({ grafico_json: null });
            }

            await dashboardServices.atualizaLucrativoOntem();
            await job.progress(100);

        } catch (error) {
            console.error('Erro ao atualizar gráficos:', error);
            return error;
        }
    }
}