const Services = require('./Services.js');
const { Op } = require('sequelize');
const LigaServices = require('../services/LigaServices.js');
const TemporadaServices = require('../services/TemporadaServices.js');
const TimeServices = require('../services/TimeServices.js');
const GolServices = require('../services/GolServices.js');
const TimestemporadaServices = require('../services/TimestemporadaServices.js');
const TipoapostaServices = require('../services/TipoapostaServices.js');
const logTo = require('../utils/logTo.js');
const { Jogo, Time, Liga, Odd, Gol, Temporada, Regravalidacoe, Pai } = require('../database/models');

const ligaServices = new LigaServices();
const timeServices = new TimeServices();
const temporadaServices = new TemporadaServices();
const tipoapostaServices = new TipoapostaServices();
const golServices = new GolServices();
const timetemporadaServices = new TimestemporadaServices();

class JogoServices extends Services {
    constructor() {
        super('Jogo');
    }


    async filtrarJogosUnicos(regras, jogosPendente = false) {
        const jogosUnicos = {};
        const jogosPorRegra = await Promise.all(
            regras.map((regra) => this.filtrarJogosPorRegra(regra, jogosPendente))
        );

        jogosPorRegra.flat().forEach((jogo) => {
            if (!jogosUnicos[jogo.id]) {
                jogosUnicos[jogo.id] = jogo;
            }
        });

        return Object.values(jogosUnicos).sort((a, b) => new Date(b.datahora) - new Date(a.datahora));
    }

    async filtrarJogosPorRegra(regra, jogosPendente = false) {
        const convertStringToArray = (stringValue) => {
            return stringValue ? stringValue.split(',').map(Number) : [];
        };

        const whereJogo = {};
        const include = [
            {
                model: Time,
                as: 'casa',
                where: {},
            },
            {
                model: Time,
                as: 'fora',
                where: {},
            },
        ];

        if (regra.pai_id) {
            include.push({
                model: Temporada,
                required: true,
                include: [
                    {
                        model: Liga,
                        required: true,
                        include: [
                            {
                                model: Pai,
                                required: true,
                                where: {
                                    id: { [Op.in]: convertStringToArray(regra.pai_id) },
                                },
                            },
                        ],
                    },
                ],
            });
        }


        if (regra.liga_id) {
            include.push({
                model: Temporada,
                required: true,
                include: [
                    {
                        model: Liga,
                        required: true,
                        where: {
                            id: { [Op.in]: convertStringToArray(regra.liga_id) },
                        },
                    },
                ],
            });
        }

        if (regra.time_id) {
            const timeIds = convertStringToArray(regra.time_id);
            whereJogo[Op.or] = [
                { casa_id: { [Op.in]: timeIds } },
                { fora_id: { [Op.in]: timeIds } },
            ];
        }

        if (regra.regravalidacoe_id) {
            include.push({
                model: Odd,
                required: true,
                where: {
                    odd: {
                        [Op.between]: [regra.oddmin || 0, regra.oddmax || Number.MAX_VALUE],
                    },
                },
                include: [
                    {
                        model: Regravalidacoe,
                        required: true,
                        as: 'regra',
                        where: {
                            id: regra.regravalidacoe_id,
                        },
                    },
                ],
            });
        }

        const results = await Jogo.findAll({
            where: {
                ...whereJogo,
                ...(jogosPendente ? { gols_casa: null } : {}),
            },
            order: [['id', 'ASC']],
            include,
        });

        let jogos = [];

        if (results.length > 0) {
            for (const result of results) {
                const tipoAposta = (await tipoapostaServices.pegaUmRegistroPorId(result.Odds[0].tipoaposta_id));
                jogos.push({
                    id: result.id,
                    casa: result.casa?.nome || null, // Define como null se não houver dados
                    fora: result.fora?.nome || null, // Define como null se não houver dados
                    placar: (result.gols_casa !== undefined && result.gols_fora !== undefined) ?
                        result.gols_casa + '-' + result.gols_fora : null, // Define como null se não houver dados
                    data: result.data || null, // Define como null se não houver dados
                    datahora: result.datahora || null, // Define como null se não houver dados
                    temporada: result.Temporada?.ano || null, // Define como null se não houver dados
                    liga: result.Temporada?.Liga?.nome || null, // Define como null se não houver dados
                    pais: result.Temporada?.Liga?.Pai?.nome || null, // Define como null se não houver dados
                    tipoAposta: tipoAposta.name || null, // Define como null se não houver dados
                    nome: result.Odds?.[0]?.nome || null, // Define como null se não houver dados
                    odd_id: result.Odds?.[0]?.id,
                    odd: result.Odds?.[0]?.odd || null, // Define como null se não houver dados
                    statusOdd: result.Odds?.[0]?.status // Define como null se não houver dados
                });
            }
        }

        return jogos;
    }

    async jogoEstruturadoIds(ids, where = {}) {
        const jogos = await Jogo.findAll({
            where: {
                ...where,
                id: {
                    [Op.in]: ids
                }
            },
            include: [
                {
                    model: Time,
                    as: 'casa',
                    required: true,
                },
                {
                    model: Time,
                    as: 'fora',
                    required: true,
                },
                {
                    model: Temporada,
                    required: true,
                },
                {
                    model: Gol,
                    required: true
                }
            ]
        });
        return jogos;
    }

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
                    },
                    paranoid: false
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
                    jogo.datahora = e.fixture.date,
                        jogo.data = e.fixture.date.split('T')[0],
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
        }
    }
}

module.exports = JogoServices;