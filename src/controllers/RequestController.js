require('dotenv').config();
const Controller = require('./Controller.js');
const RequestServices = require('../services/RequestServices.js');
const LigaServices = require('../services/LigaServices.js');
const JogoServices = require('../services/JogoServices.js');
const BetServices = require('../services/BetServices.js');
const TipoapostaServices = require('../services/TipoapostaServices.js');
const OddServices = require('../services/OddServices.js');
const axios = require('axios');
const https = require('https');
const logTo = require('../utils/logTo.js');
const formatMilliseconds = require('../utils/formatMilliseconds.js');
const toDay = require('../utils/toDay.js');

const requestServices = new RequestServices();
const ligaServices = new LigaServices();
const jogoServices = new JogoServices();
const betServices = new BetServices();
const tipoApostaServices = new TipoapostaServices();
const oddServices = new OddServices();

const headers = {
    'x-rapidapi-host': process.env.X_RAPIDAPI_HOST,
    'x-rapidapi-key': process.env.X_RAPIDAPI_KEY
};
const URL = process.env.URL_API

// Configurar axios globalmente
axios.defaults.httpsAgent = new https.Agent({
    rejectUnauthorized: false
});


class RequestController extends Controller {
    constructor() {
        super(requestServices);
    }

    async dadosSport(date = toDay()) {
        if (await requestServices.podeRequisitar()) {
            const startTime = Date.now(); // Armazena o tempo de início
            logTo('Iniciando dadosSport...');
            let page = 1;
            const params = {
                bookmaker: '8',
                date: date,
                page: page
            };

            try {
                let response = await axios.get(URL + 'odds', { headers, params });
                if (response.status === 200) {
                    const totalPaginas = response.data.paging.total;

                    while (page <= totalPaginas && await requestServices.podeRequisitar()) {
                        logTo(`Processando página ${page} de ${totalPaginas}...`);
                        for (const e of response.data.response) {
                            const liga = await ligaServices.pegaLiga(e.league);
                            let jogo = await jogoServices.pegaUmRegistro({ where: { id_sports: e.fixture.id } });

                            if (!jogo) {
                                await this.adicionaJogos(date);
                                jogo = await jogoServices.pegaUmRegistro({ where: { id_sports: e.fixture.id } });
                            }
                            if (jogo !== null) {
                                for (const bookmaker of e.bookmakers) {
                                    const casaAposta = await betServices.pegaBet(bookmaker);
                                    for (const odds of bookmaker.bets) {
                                        const tipoAposta = await tipoApostaServices.pegaTipoAposta(odds);
                                        await oddServices.pegaOdd(tipoAposta, jogo, casaAposta, odds);
                                    }
                                }
                            }else{
                                logTo('Jogo não encontrado! fixture/jogo:' + e.fixture.id );
                            }
                        }


                        if (++page <= totalPaginas) {
                            params.page = page;
                            response = await axios.get(URL + 'odds', { headers, params });
                            if (response.status !== 200) {
                                logTo(`Erro ao requisitar página: ${page}`);
                                break;
                            }
                        }
                    }
                }
            } catch (error) {
                logTo(`Erro durante a requisição: ${error.message}`);
                console.log(error)
            } finally {
                const endTime = Date.now(); // Armazena o tempo de término
                const duration = endTime - startTime; // Calcula a duração
                logTo(`Tempo de execução: ${formatMilliseconds(duration)}ms`);
            }
        } else {
            logTo('Limite de requisições atingido...');
        }
    }

    async adicionaJogos(date = toDay()) {
        let pageJogos = 1;
        let paramsJogos = { 
            date: date
            //,page: pageJogos 
        }

        try {
            if (await requestServices.podeRequisitar()) {
                logTo("Iniciando a busca por jogos na API");
                let responseJogos = await axios.get(URL + 'fixtures', { headers, params: paramsJogos });
                
                if (responseJogos.status === 200) {
                    await jogoServices.adicionaJogos(responseJogos);

                    /* FIZ ATOOOOOAAA VAI FICAR AQUI CASO UM DIA EXISTA PAGINAÇÃO
                    const totalPaginasJogos = responseJogos.data.paging.total;
                    logTo(`Processando página ${pageJogos} de ${totalPaginasJogos}...`);
                    for (; pageJogos <= totalPaginasJogos && await requestServices.podeRequisitar(); pageJogos++) {
                        await jogoServices.adicionaJogos(responseJogos);
                        if (pageJogos < totalPaginasJogos) {
                            paramsJogos.page = pageJogos + 1;
                            responseJogos = await axios.get(URL + 'fixture', { headers, params: paramsJogos });
                            if (responseJogos.status !== 200) {
                                logTo(`Erro ao requisitar página de jogos: ${pageJogos}`);
                                break;
                            }
                        }
                    }
                    FIZ ATOOOOOAAA VAI FICAR AQUI CASO UM DIA EXISTA PAGINAÇÃO*/
                }else{
                    logTo('Erro ao buscar dados de jogos! status <> 200. Status: '+ responseJogos.status);
                }
            }
        } catch (error) {
            logTo(`Erro durante a adição de jogos: ${error.message}`);
            console.error(`Erro durante a adição de jogos: ${error.message}`);
        }
    }
}

module.exports = RequestController;
