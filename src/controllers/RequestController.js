require('dotenv').config();
const Controller = require('./Controller.js');
const RequestServices = require('../services/RequestServices.js');
const LigaServices = require('../services/LigaServices.js');
const JogoServices = require('../services/JogoServices.js');
const BetServices = require('../services/BetServices.js');
const TipoapostaServices = require('../services/TipoapostaServices.js');
const OddServices = require('../services/OddServices.js');
const Regra = require('../services/RegravalidacoeServices.js');
const RequisicaopendenteServices = require('../services/RequisicaopendenteServices.js');
const axios = require('axios');
const https = require('https');
const logTo = require('../utils/logTo.js');
const salvaJson = require('../utils/salvaJsonArquivo.js');
const formatMilliseconds = require('../utils/formatMilliseconds.js');
const toDay = require('../utils/toDay.js');


const regraServices = new Regra();
const requestServices = new RequestServices();
const ligaServices = new LigaServices();
const jogoServices = new JogoServices();
const betServices = new BetServices();
const tipoApostaServices = new TipoapostaServices();
const oddServices = new OddServices();
const reqPendenteServices = new RequisicaopendenteServices();

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

    async dadosSport(date = toDay(1)) {
        if (await requestServices.podeRequisitar()) {
            const startTime = Date.now();
            logTo(`Iniciando dadosSport (${date})...`);
            const reqPendente = await reqPendenteServices.pegaPendente('odds');
            let page = reqPendente.pagina;
            const params = {
                timezone: 'America/Sao_Paulo',
                bookmaker: '8',
                date: date,
                page: page
            };

            try {
                let response = await axios.get(URL + 'odds', { headers, params });
                if (response.status === 200) {
                    salvaJson('odds', page, response.data);
                    const totalPaginas = response.data.paging.total;
                    if (reqPendente.pagina == 1) {
                        await this.adicionaJogos(date);
                    }
                    const todasLigas = await ligaServices.pegaTodosOsRegistros();
                    const todosJogos = await jogoServices.pegaTodosOsRegistros({where: {'data': date }});
                    const todasCasasAposta = await betServices.pegaTodosOsRegistros();
                    const todosTipoAposta = await tipoApostaServices.pegaTodosOsRegistros();
                    const regras = await regraServices.pegaTodosOsRegistros();

                    let endTime = Date.now();
                    while (page <= totalPaginas && await requestServices.podeRequisitar()) {
                        logTo(`Processando página ${page} de ${totalPaginas}...`);
                        for (const e of response.data.response) {
                            // Busca a liga no cache ou cria se não existir
                            let liga = todasLigas.find(l => l.id_sports === e.league.id)
                                || await ligaServices.pegaLiga(e.league);

                            // Busca o jogo no cache ou cria se não existir
                            let jogo = todosJogos.find(l => l.id_sports === e.fixture.id)
                                || await jogoServices.pegaUmRegistro({ where: { id_sports: e.fixture.id } });
                                
                            if (jogo !== null) {
                                //LOOP RODANDO AS CASAS DE APOSTA
                                for (const bookmaker of e.bookmakers) {
                                    let casaAposta = todasCasasAposta.find(l => l.id_sports === bookmaker.id)
                                        || await betServices.pegaBet(bookmaker);
                                    
                                    //LOOP RODANDOS AS ODDS
                                    for (const modeloAposta of bookmaker.bets) {
                                        if (!todosTipoAposta.some(l => l.id_sports === modeloAposta.id)) {
                                            const newTipoAposta = await tipoApostaServices.pegaTipoAposta(modeloAposta);
                                            todosTipoAposta.push(newTipoAposta)
                                        }
                                    }
                                    await oddServices.pegaOdd(todosTipoAposta, jogo, casaAposta, bookmaker.bets, regras);
                                }
                            } else {
                                logTo('Jogo não encontrado! fixture/jogo:' + e.fixture.id);
                            }
                        }

                        reqPendente.pagina = page;
                        if ((++page) <= totalPaginas) {
                            reqPendente.save();
                            params.page = page;
                            //await new Promise(resolve => setTimeout(resolve, 5000));
                            response = await axios.get(URL + 'odds', { headers, params });
                            salvaJson('odds', page, response.data);
                            if (response.status !== 200) {
                                logTo(`Erro ao requisitar página: ${page}`);
                                break;
                            }
                        } else {
                            reqPendente.destroy();
                        }
                    }
                } else {
                    logTo(`Erro ao requisitar página: ${page}`);
                }
            } catch (error) {
                logTo('Erro durante a requisição:', error.message);
                console.error('Erro durante a requisição:', error.message);
            } finally {
                let endTime = Date.now();
                let duration = endTime - startTime;
                logTo(`Tempo de execução: ${formatMilliseconds(duration)} data: ${date}`);
            }
        } else {
            logTo(`Limite de requisições atingido... (${date})`);
        }
    }

    async adicionaJogos(date = toDay(-1)) {
        let paramsJogos = {
            timezone: 'America/Sao_Paulo',
            date: date
        }

        try {
            if (await requestServices.podeRequisitar()) {
                logTo(`Iniciando a busca por jogos na API data (${date})`);
                let responseJogos = await axios.get(URL + 'fixtures', { headers, params: paramsJogos });

                if (responseJogos.status === 200) {
                    salvaJson('fixtures', 0, responseJogos.data);
                    await jogoServices.adicionaJogos(responseJogos);
                } else {
                    logTo('Erro ao buscar dados de jogos! status <> 200. Status: ' + responseJogos.status);
                }
            }
        } catch (error) {
            logTo(`Erro durante a adição de jogos: ${error.message}`);
            console.error(`Erro durante a adição de jogos: ${error.message}`);
        }
    }
}

module.exports = RequestController;
