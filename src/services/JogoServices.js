const Services = require('./Services.js');
const LigaServices = require('../services/LigaServices.js');
const TemporadaServices = require('../services/TemporadaServices.js');
const TimeServices = require('../services/TimeServices.js');
const GolServices = require('../services/GolServices.js');
const TimestemporadaServices = require('../services/TimestemporadaServices.js');

const ligaServices = new LigaServices();
const timeServices = new TimeServices();
const temporadaServices = new TemporadaServices();
const golServices = new GolServices();
const timetemporadaServices = new TimestemporadaServices();


class JogoServices extends Services {
    constructor() {
        super('Jogo');
    }

    async adicionaJogos(response) {
        for (const e of response.data.response) {
            let casa = await timeServices.pegaTime(e.teams.home);
            let fora = await timeServices.pegaTime(e.teams.away);
            let liga = await ligaServices.pegaLiga(e.league);
            let temporada = await temporadaServices.pegaTemporada(e.league, liga);

            let jogo = await super.pegaUmRegistro({
                where: {
                    'casa_id': casa.id,
                    'fora_id': fora.id,
                    'id_sports': e.fixture.id,
                }
            })
            if (!jogo) {
                jogo = await super.criaRegistro({
                    'casa_id': casa.id,
                    'fora_id': fora.id,
                    'datahora': e.fixture.date,
                    'gols_casa': e.goals.home,
                    'gols_fora': e.goals.away,
                    'status': 'Não iniciado',
                    'id_sports': e.fixture.id,
                    'temporada_id': temporada.id
                });
            }else{
                jogo.gols_casa = e.goals.home;
                jogo.gols_fora = e.goals.away;
                jogo.gols_status = 'Não iniciado';
                await jogo.save();
            }
            let gols = await golServices.adicionaGols(e.score, jogo);
            let timestemporada = await timetemporadaServices.pegaTimeNaTemporada(jogo);
        }
    }
}

module.exports = JogoServices;