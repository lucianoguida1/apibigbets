const Services = require('./Services.js');
const LigaServices = require('../services/LigaServices.js');
const TemporadaServices = require('../services/TemporadaServices.js');
const TimeServices = require('../services/TimeServices.js');
const ligaServices = new LigaServices();
const timeServices = new TimeServices();
const temporadaServices = new TemporadaServices();


class JogoServices extends Services {
    constructor(){
        super('Jogo');
    }

    async adicionaJogos(response){
        for (const e of response.data.response) {
            let casa = await timeServices.pegaTime(e.teams.home);
            let fora = await timeServices.pegaTime(e.teams.away);
            let liga = await ligaServices.pegaLiga(e.league);
            let temporada = await temporadaServices.pegaTemporada(e.league, liga);

            const jogo = await super.criaRegistro({
                'casa_id': casa.id,
                'fora_id': fora.id,
                'datahora': e.fixture.date,
                'status': 'Não iniciado',
                'id_sports': e.fixture.id,
                'temporada_id': temporada.id
            });
        }
    }
}

module.exports = JogoServices;