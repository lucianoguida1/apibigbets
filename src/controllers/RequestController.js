const Controller = require('./Controller.js');
const RequestServices = require('../services/RequestServices.js');
const LigaServices = require('../services/LigaServices.js');
const TemporadaServices = require('../services/TemporadaServices.js');
const JogoServices = require('../services/JogoServices.js');
const TimeServices = require('../services/TimeServices.js');
const isHoje = require('../utils/isHoje.js');
const sleep = require('../utils/sleep.js');
const axios = require('axios');

const requestServices = new RequestServices();
const ligaServices = new LigaServices();
const jogoServices = new JogoServices();
const timeServices = new TimeServices();
const temporadaServices = new TemporadaServices();

const headers = {
    'x-rapidapi-host': 'v3.football.api-sports.io',
    'x-rapidapi-key': '6aab030a4ede6e3a399b5ad7e1bdadbd'
}

class RequestController extends Controller {
    constructor() {
        super(requestServices);
    }

    async dadosSport() {
        if (await requestServices.podeRequisitar()) {
            let page = 1;
            const params = {
                bookmaker: '8',
                date: '2024-08-28',
                page: page
            };
            let response = await axios.get('http://localhost:3333/odds', { headers, params });

            if (response.status === 200) {
                const totalPaginas = response.data.paging.total;

                for (; page <= totalPaginas && await requestServices.podeRequisitar(); page++) {
                    for (const e of response.data.response) {
                        // Busca ou adiciona a liga
                        let liga = await ligaServices.pegaLiga(e.league);

                        // Busca ou adiciona o jogo
                        let jogo = await jogoServices.pegaUmRegistro({ where: { id_sports: e.fixture.id } });

                        if (!jogo) {
                            let pageJogos = 1;
                            const paramsJogos = { date: '2024-08-28', page: pageJogos };
                            let responseJogos = await axios.get('http://localhost:3333/fixture', { headers, paramsJogos });

                            if (responseJogos.status === 200) {
                                const totalPaginasJogos = responseJogos.data.paging.total;

                                for (; pageJogos <= totalPaginasJogos && await requestServices.podeRequisitar(); pageJogos++) {
                                    await jogoServices.adicionaJogos(responseJogos);
                                    paramsJogos.page = pageJogos + 1;

                                    if (pageJogos < totalPaginasJogos) {
                                        responseJogos = await axios.get('http://localhost:3333/fixture', { headers, paramsJogos });
                                        if (responseJogos.status !== 200) {
                                            console.error(`Erro ao requisitar página de jogos: ${pageJogos}`);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    params.page = page + 1;
                    if (page < totalPaginas) {
                        response = await axios.get('http://localhost:3333/odds', { headers, params });
                        if (response.status !== 200) {
                            console.error(`Erro ao requisitar página: ${page}`);
                            break;
                        }
                    }
                }
            }
        }
    }

}


module.exports = RequestController;