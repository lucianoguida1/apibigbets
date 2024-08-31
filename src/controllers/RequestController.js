const Controller = require('./Controller.js');
const RequestServices = require('../services/RequestServices.js');
const LigaServices = require('../services/LigaServices.js');
const JogoServices = require('../services/JogoServices.js');
const BetServices = require('../services/BetServices.js');
const TipoapostaServices = require('../services/TipoapostaServices.js');
const OddServices = require('../services/OddServices.js');
const axios = require('axios');

const requestServices = new RequestServices();
const ligaServices = new LigaServices();
const jogoServices = new JogoServices();
const betServices = new BetServices();
const tipoApostaServices = new TipoapostaServices();
const oddServices = new OddServices();

const headers = {
    'x-rapidapi-host': 'v3.football.api-sports.io',
    'x-rapidapi-key': '6aab030a4ede6e3a399b5ad7e1bdadbd'
};

class RequestController extends Controller {
    constructor() {
        super(requestServices);
    }

    async dadosSport() {
        if (await requestServices.podeRequisitar()) {
            let page = 1;
            let params = {
                bookmaker: '8',
                date: '2024-08-28',
                page: page
            };

            try {
                let response = await axios.get('http://localhost:3333/odds', { headers, params });
                if (response.status === 200) {
                    const totalPaginas = response.data.paging.total;

                    for (; page <= totalPaginas && await requestServices.podeRequisitar(); page++) {
                        for (const e of response.data.response) {
                            const liga = await ligaServices.pegaLiga(e.league);
                            let jogo = await jogoServices.pegaUmRegistro({ where: { id_sports: e.fixture.id } });

                            if (!jogo) {
                                await this.adicionaJogos('2024-08-28', e.fixture.id);
                                jogo = await jogoServices.pegaUmRegistro({ where: { id_sports: e.fixture.id } });
                            }

                            const casaAposta = await betServices.pegaBet(e.bookmakers[0]);
                            for (const odds of e.bookmakers[0].bets) {
                                const tipoAposta = await tipoApostaServices.pegaTipoAposta(odds);
                                await oddServices.pegaOdd(tipoAposta, jogo, casaAposta, odds);
                            }
                        }

                        if (page < totalPaginas) {
                            params.page = page + 1;
                            response = await axios.get('http://localhost:3333/odds', { headers, params });
                            if (response.status !== 200) {
                                console.error(`Erro ao requisitar página: ${page}`);
                                break;
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`Erro durante a requisição: ${error.message}`);
            }
        }
    }

    async adicionaJogos(date, fixtureId) {
        let pageJogos = 1;
        const paramsJogos = { date, page: pageJogos };

        try {
            let responseJogos = await axios.get('http://localhost:3333/fixture', { headers, paramsJogos });
            if (responseJogos.status === 200) {
                const totalPaginasJogos = responseJogos.data.paging.total;

                for (; pageJogos <= totalPaginasJogos && await requestServices.podeRequisitar(); pageJogos++) {
                    await jogoServices.adicionaJogos(responseJogos);
                    if (pageJogos < totalPaginasJogos) {
                        paramsJogos.page = pageJogos + 1;
                        responseJogos = await axios.get('http://localhost:3333/fixture', { headers, paramsJogos });
                        if (responseJogos.status !== 200) {
                            console.error(`Erro ao requisitar página de jogos: ${pageJogos}`);
                            break;
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`Erro durante a adição de jogos: ${error.message}`);
        }
    }
}

module.exports = RequestController;
