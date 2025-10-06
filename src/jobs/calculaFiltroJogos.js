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
            const filtroTimes = await filtrojogoServices.pegaTodosOsRegistrosECampos();

            for (const filtroTime of filtroTimes) {
                // Calcula o progresso em porcentagem dos filtros
                const totalFiltros = filtroTimes.length;
                const filtrosProcessados = filtroTimes.indexOf(filtroTime) + 1;
                const progresso = Math.round((filtrosProcessados / totalFiltros) * 100);

                await job.progress(progresso);
                if (filtroTime && typeof filtroTime.sql === 'string' && filtroTime.sql.trim()) {
                    // ISO de “amanhã” (mesma lógica do seu código)
                    const endDate = new Date();
                    endDate.setDate(endDate.getDate() + 1);
                    const formattedDate = endDate.toISOString().split('T')[0]; // YYYY-MM-DD

                    let sqlF = filtroTime.sql;

                    if (sqlF.includes('@data')) {
                        sqlF = sqlF.replace(/@data/g, `'${formattedDate}'`);
                    }
                    if (sqlF.includes('@filtrojogoid')) {
                        // Se no SQL o campo é numérico, NÃO coloque aspas:
                        // sqlF = sqlF.replace(/@filtrojogoid/g, String(filtroTime.id));
                        sqlF = sqlF.replace(/@filtrojogoid/g, `'${filtroTime.id}'`);
                    }

                    const results = await sequelize.query(sqlF, {
                        type: sequelize.QueryTypes.SELECT, // use Sequelize, não sequelize.QueryTypes
                    });

                    // use results...
                } else {
                    logTo(`Filtro de jogos inválido: objeto ou SQL ausente (id=${filtroTime?.id ?? 'desconhecido'})\n Nome: ${filtroTime?.nome ?? 'desconhecido'}`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }

            await job.progress(100);
        } catch (error) {
            logTo('Erro ao calcular Filtro de Jogos:', error.message);
            console.error('Erro ao calcular Filtro de Jogos:', error.message);
        }
    }
}