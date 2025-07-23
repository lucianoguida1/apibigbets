const logTo = require("../utils/logTo");
const { sequelize } = require('../database/models');

const FiltrojogoServices = require('../services/FiltrojogoServices.js');
const filtrojogoServices = new FiltrojogoServices();

module.exports = {
    key: 'calculaFiltroJogos',
    options: {
        delay: 1000,
        attempts: 3,
    },
    async handle(job) {
        try {
            const filtroTimes = await filtrojogoServices.pegaTodosOsRegistros();

            for (const filtroTime of filtroTimes) {
                // Calcula o progresso em porcentagem dos filtros
                const totalFiltros = filtroTimes.length;
                const filtrosProcessados = filtroTimes.indexOf(filtroTime) + 1;
                const progresso = Math.round((filtrosProcessados / totalFiltros) * 100);

                await job.progress(progresso);
                if (filtroTime && filtroTime.sql.includes('@data')) {
                    const endDate = new Date();
                    endDate.setDate(endDate.getDate() + 1);
                    const formattedDate = endDate.toISOString().split('T')[0];

                    // Certifique-se de que filtroTime.sql está sendo usado corretamente
                    let sqlF = filtroTime.sql.replace(/@data/g, `'${formattedDate}'`);
                    sqlF = sqlF.replace(/@filtrojogoid/g, `'${filtroTime.id}'`);

                    const results = await sequelize.query(sqlF, {
                        type: sequelize.QueryTypes.SELECT,
                    });

                }
            }

            await job.progress(100);
        } catch (error) {
            logTo('Erro ao calcular Filtro de Jogos:', error.message);
            console.error('Erro ao calcular Filtro de Jogos:', error.message);
        }
    }
}