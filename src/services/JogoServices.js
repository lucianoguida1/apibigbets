const Services = require('./Services.js');
const { Op } = require('sequelize');
const LigaServices = require('../services/LigaServices.js');
const TemporadaServices = require('../services/TemporadaServices.js');
const TimeServices = require('../services/TimeServices.js');
const GolServices = require('../services/GolServices.js');
const TimestemporadaServices = require('../services/TimestemporadaServices.js');
const TipoapostaServices = require('../services/TipoapostaServices.js');
const logTo = require('../utils/logTo.js');
const { Jogo, Time, Liga, Odd, Gol, Temporada, Regravalidacoe, Filtrojogo, sequelize } = require('../database/models');

const ligaServices = new LigaServices();
const timeServices = new TimeServices();
const temporadaServices = new TemporadaServices();
const tipoapostaServices = new TipoapostaServices();
const golServices = new GolServices();
const timetemporadaServices = new TimestemporadaServices();

const formatMilliseconds = require('../utils/formatMilliseconds.js');


class JogoServices extends Services {
    constructor() {
        super('Jogo');
    }


    async filtrarJogosUnicos(regras, jogosPendente = false) {
        regras.map((regra, index) => {
            if (!regra.id) {
                regra.id = `${index + 1}`;
            }
            return regra;
        });

        const jogosPorRegra = [];
        for (const regra of regras) {
            const jogos = await this.filtrarJogosPorRegra(regra, jogosPendente);
            jogosPorRegra.push(...jogos);
        }

        return Object.values(jogosPorRegra).sort((a, b) => new Date(a.datahora) - new Date(b.datahora));
    }

    async filtrarJogosPorRegra(regra, jogosPendente = false) {
        const convertStringToArray = (stringValue) => {
            return stringValue ? stringValue.split(',').map(Number) : [];
        };
        let filtroTime = null;
        if (regra.filtrojogo_id) {
            filtroTime = await Filtrojogo.findOne({
                where: { id: regra.filtrojogo_id }
            });

            if (filtroTime && filtroTime.sql.includes('@data') && jogosPendente) {
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + 1);
                const formattedDate = endDate.toISOString().split('T')[0];

                // Certifique-se de que filtroTime.sql está sendo usado corretamente
                let sqlF = filtroTime.sql.replace(/@data/g, `'${formattedDate}'`);
                sqlF = sqlF.replace(/@filtrojogoid/g, `'${filtroTime.id}'`);

                const results = await sequelize.query(sqlF, {
                    type: sequelize.QueryTypes.SELECT,
                });

                console.log('Results:', results);
            }
        }

        let regraV = regra.regravalidacoe_id;
        let regraV1 = regra.regravalidacoe2_id;
        let regraV2 = regra.regravalidacoe3_id;

        const sql = `

        select distinct j.id,casa.nome as casa,fora.nome as fora,concat(j.gols_casa,'-',j.gols_fora) as placar,
        j.data,j.datahora,t.ano as temporada,l.nome as liga,p.nome as pais,COALESCE(tp.nome,tp.name) as tipoAposta,
        o.nome,o.id as odd_id,o.odd,o.status as statusodd,${regra.id} as regra_id
        from jogos j
        inner join times casa on j.casa_id = casa.id
        inner join times fora on j.fora_id = fora.id
        inner join temporadas t on t.id = j.temporada_id
        inner join ligas l on l.id = t.liga_id
        inner join pais p on p.id = l.pai_id
        inner join odds o on o.jogo_id = j.id
        ${regraV1 ? `inner join odds o2 on o2.jogo_id = j.id` : ''}
        ${regraV2 ? `inner join odds o3 on o3.jogo_id = j.id` : ''}
        ${filtroTime && filtroTime.ambos_times ? `
        ${regra.filtrojogo_id ? `inner join filtrojogodata fj on fj.filtrojogo_id = ${regra.filtrojogo_id}
                                            and (j.data::DATE) = (fj.data::DATE)
                                            and ((j.casa_id = fj.time_id )
                                            ${regra.time_id ? `or (j.casa_id in (${regra.time_id}) or j.fora_id in (${regra.time_id})))` : `)`}
                                            ` : ``}
        ${regra.filtrojogo_id ? `inner join filtrojogodata fj2 on fj2.filtrojogo_id = ${regra.filtrojogo_id}
                                            and (j.data::DATE) = (fj2.data::DATE)
                                            and ((j.fora_id = fj2.time_id)
                                            ${regra.time_id ? `or (j.casa_id in (${regra.time_id}) or j.fora_id in (${regra.time_id})))` : `)`}
                                            ` : ``}` : `
        ${regra.filtrojogo_id ? `inner join filtrojogodata fj on fj.filtrojogo_id = ${regra.filtrojogo_id}
                                            and (j.data::DATE) = (fj.data::DATE)
                                            and ((j.casa_id = fj.time_id or j.fora_id = fj.time_id)
                                            ${regra.time_id ? `or (j.casa_id in (${regra.time_id}) or j.fora_id in (${regra.time_id})))` : `)`}
                                            ` : ``}`}
        inner join tipoapostas tp on tp.id = o.tipoaposta_id
        where j."deletedAt" is null
        ${jogosPendente ? `and j.gols_casa is null` : `and j.gols_casa is not null`}
        ${regraV > 9999990 ? `
            and (
                case
                    when ${regraV} = 9999991 and (j.casa_id in (${regra.time_id}) ${regra.filtrojogo_id ? `or j.casa_id = fj.time_id` : ``}) then o.regra_id = 1
                    when ${regraV} = 9999991 and (j.fora_id in (${regra.time_id}) ${regra.filtrojogo_id ? `or j.fora_id = fj.time_id` : ``}) then o.regra_id = 3
                    when ${regraV} = 9999992 then o.regra_id = 2
                    when ${regraV} = 9999993 and (j.casa_id in (${regra.time_id}) ${regra.filtrojogo_id ? `or j.casa_id = fj.time_id` : ``}) then o.regra_id = 3
                    when ${regraV} = 9999993 and (j.fora_id in (${regra.time_id}) ${regra.filtrojogo_id ? `or j.fora_id = fj.time_id` : ``}) then o.regra_id = 1
                    when ${regraV} = 9999994 and (j.casa_id in (${regra.time_id}) ${regra.filtrojogo_id ? `or j.casa_id = fj.time_id` : ``}) then o.regra_id = 124
                    when ${regraV} = 9999994 and (j.fora_id in (${regra.time_id}) ${regra.filtrojogo_id ? `or j.fora_id = fj.time_id` : ``}) then o.regra_id = 126
                    when ${regraV} = 9999995 and (j.casa_id in (${regra.time_id}) ${regra.filtrojogo_id ? `or j.casa_id = fj.time_id` : ``}) then o.regra_id = 126
                    when ${regraV} = 9999995 and (j.fora_id in (${regra.time_id}) ${regra.filtrojogo_id ? `or j.fora_id = fj.time_id` : ``}) then o.regra_id = 124
                    else o.regra_id = ${regraV}
                end
            )
            ` : `and o.regra_id = ${regraV}`}
        ${!regra.filtrojogo_id && regra.time_id ? `and  (j.casa_id in (${regra.time_id}) or j.fora_id in (${regra.time_id}))` : ''}
        ${regra.pai_id ? `and (p.id in (${convertStringToArray(regra.pai_id)}))` : ''}
        ${regra.liga_id ? `and (l.id in (${convertStringToArray(regra.liga_id)}))` : ''}
        and (o.odd between ${regra.oddmin || 0} and ${regra.oddmax || Number.MAX_VALUE})
        ${regra.regravalidacoe2_id ? `and (o2.regra_id = ${regra.regravalidacoe2_id} and o2.odd between ${regra.oddmin2 || 0} and ${regra.oddmax2 || Number.MAX_VALUE})` : ''}
        ${regra.regravalidacoe3_id ? `and (o3.regra_id = ${regra.regravalidacoe3_id} and o3.odd between ${regra.oddmin3 || 0} and ${regra.oddmax3 || Number.MAX_VALUE})` : ''}
        ORDER BY j.id ASC
        LIMIT 3500;`;

        console.log('sql', sql)
        let results = [];
        try {
            results = await sequelize.query(sql, {
                type: sequelize.QueryTypes.SELECT,
            });
        } catch (error) {
            console.log(error);
        }
        return results;
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
            const jogos = await super.pegaTodosOsRegistros({
                where: {
                    createdAt: {
                        [Op.gte]: new Date(new Date() - 3 * 24 * 60 * 60 * 1000) // Últimos 3 dias
                    }
                }
            });

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
                let jogo = jogos.find(j => j.id_sports === e.fixture.id && j.casa_id === casa.id && j.fora_id === fora.id);

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