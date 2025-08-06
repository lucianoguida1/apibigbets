const logTo = require("../utils/logTo");
const toDay = require('../utils/toDay.js');
const axios = require('axios');
const salvaJson = require('../utils/salvaJsonArquivo.js');


const RequestServices = require('../services/RequestServices.js');
const requestServices = new RequestServices();
const JogoServices = require('../services/JogoServices.js');
const jogoServices = new JogoServices();

const headers = {
    'x-rapidapi-host': process.env.X_RAPIDAPI_HOST,
    'x-rapidapi-key': process.env.X_RAPIDAPI_KEY
};
const URL = process.env.URL_API

module.exports = {
    key: 'getJogosAPI',
    options: {
        delay: 0,
        attempts: 1,
    },

    async handle(job) {
        let { date } = job.data;
        if (!date) date = toDay();

        let paramsJogos = {
            timezone: 'America/Sao_Paulo',
            date: date
        }

        try {
            if (await requestServices.podeRequisitar()) {
                let responseJogos = await axios.get(URL + 'fixtures', { headers, params: paramsJogos });
                await job.progress(50);
                if (responseJogos.status === 200) {
                    salvaJson('fixtures', 0, responseJogos.data);
                    await job.progress(70);
                    await jogoServices.adicionaJogos(responseJogos);
                    await job.progress(100);
                } else {
                    logTo('Erro ao buscar dados de jogos! status <> 200. Status: ' + responseJogos.status);
                }
            }
        } catch (error) {
            logTo(`Erro durante a adição de jogos: JOB(${job.id}) ${error.message}`);
            console.error(error);
        }
    }
}