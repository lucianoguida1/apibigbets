const Services = require('./Services.js');
const LigaServices = require('../services/LigaServices.js');
const TemporadaServices = require('../services/TemporadaServices.js');
const TimeServices = require('../services/TimeServices.js');
const GolServices = require('../services/GolServices.js');
const TimestemporadaServices = require('../services/TimestemporadaServices.js');
const logTo = require('../utils/logTo.js');
const dataSource = require('../database/models');
const { Jogo, Time, Liga, Odd, Gol, Temporada, Regravalidacoe, Tipoaposta } = require('../database/models');

const ligaServices = new LigaServices();
const timeServices = new TimeServices();
const temporadaServices = new TemporadaServices();
const golServices = new GolServices();
const timetemporadaServices = new TimestemporadaServices();

class JogoServices extends Services {
    constructor() {
        super('Jogo');
    }

    // Função para buscar todos os jogos com seus relacionamentos e filtro 'where'
    static async pegaTodosOsJogos(modelosRelacionados = [], filtroWhere = {}, limit = 100, offset = 0) {
        try {
            // Defina os relacionamentos disponíveis para inclusão
            const relacionamentos = [
                {
                    model: Time,
                    as: 'casa',
                    required: modelosRelacionados.includes('casa'), // Se incluído no array, será requerido
                },
                {
                    model: Time,
                    as: 'fora',
                    required: modelosRelacionados.includes('fora'),
                },
                {
                    model: Liga,
                    required: modelosRelacionados.includes('liga'),
                },
                {
                    model: Odd,
                    required: modelosRelacionados.includes('odd'),
                    include: [
                        {
                            model: Regravalidacoe,
                            require: true,
                            as: 'regra'
                        }
                    ]
                },
                {
                    model: Gol,
                    required: modelosRelacionados.includes('gol'),
                }
            ];

            // Filtrar os relacionamentos que serão usados, considerando se foram incluídos no array
            const relacionamentosFiltrados = relacionamentos.filter(rel => modelosRelacionados.includes(rel.as) || rel.required === true);

            // Realiza a consulta com os relacionamentos filtrados
            const jogos = await Jogo.findAll({
                where: filtroWhere, // Aplica o filtro passado por parâmetro
                include: relacionamentosFiltrados, // Inclui apenas os relacionamentos filtrados
                order: [['data', 'DESC']], // Ordena os jogos pela data
                limit, // Limite de registros por página
                offset // Deslocamento da paginação
            });

            return jogos;
        } catch (error) {
            console.error('Erro ao buscar os jogos:', error);
            throw error;
        }
    }


    async adicionaJogos(response) {
        try {
            // Pega todos os registros de times, ligas e temporadas de uma vez
            const todosTimes = await timeServices.pegaTodosOsRegistros();
            const todasLigas = await ligaServices.pegaTodosOsRegistros();
            const todasTemporadas = await temporadaServices.pegaTodosOsRegistros();

            const jogosParaCriar = [];
            let jogosInseridos = [];

            for (const e of response.data.response) {
                // Busca o time da casa e de fora no cache ou cria se não existir
                let casa = todosTimes.find(time => time.id_sports === e.teams.home.id)
                    || await timeServices.pegaTime(e.teams.home);
                let fora = todosTimes.find(time => time.id_sports === e.teams.away.id)
                    || await timeServices.pegaTime(e.teams.away);

                // Busca a liga no cache ou cria se não existir
                let liga = todasLigas.find(l => l.id_sports === e.league.id)
                    || await ligaServices.pegaLiga(e.league);

                // Busca a temporada no cache ou cria se não existir
                //let temporadaKey = ${e.league.id}_${liga.id};
                let temporada = todasTemporadas.find(t => t.id_league === liga.id && t.ano === e.league.season)
                    || await temporadaServices.pegaTemporada(e.league, liga);

                // Busca o jogo no banco de dados
                let jogo = await super.pegaUmRegistro({
                    where: {
                        'casa_id': casa.id,
                        'fora_id': fora.id,
                        'id_sports': e.fixture.id,
                    }
                });

                if (!jogo) {
                    jogosParaCriar.push({
                        'casa_id': casa.id,
                        'fora_id': fora.id,
                        'datahora': e.fixture.date,
                        'data': e.fixture.date.split('T')[0],
                        'gols_casa': e.goals.home,
                        'gols_fora': e.goals.away,
                        'status': e.fixture.status.long,
                        'id_sports': e.fixture.id,
                        'temporada_id': temporada.id
                    });
                } else {
                    jogo.gols_casa = e.goals.home;
                    jogo.gols_fora = e.goals.away;
                    jogo.status = e.fixture.status.long;
                    await golServices.adicionaGols(e.score, jogo);
                    jogo.save();
                }
            }

            // Efetua criação de todos os jogos em batch
            if (jogosParaCriar.length > 0) {
                jogosInseridos = await super.criaVariosRegistros(jogosParaCriar);
            }

            for (const jogo of jogosInseridos) {
                const e = response.data.response.find(r => r.fixture.id === jogo.id_sports);
                await golServices.adicionaGols(e.score, jogo);
                await timetemporadaServices.pegaTimeNaTemporada(jogo);
            }
        } catch (error) {
            logTo(error.message);
            console.log(error);
        }
    }
}

module.exports = JogoServices;