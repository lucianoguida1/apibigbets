const Services = require('./Services.js');

class TimestemporadaServices extends Services {
    constructor() {
        super('Timestemporada');
    }

    async pegaTimeNaTemporada(jogo) {
        const times = [jogo.casa_id, jogo.fora_id];
        const timesNaTemporada = [];

        for (const timeId of times) {
            let timeT = await super.pegaUmRegistro({ where: { 'time_id': timeId, 'temporada_id': jogo.temporada_id } });

            if (!timeT) {
                timeT = await super.criaRegistro({ 'time_id': timeId, 'temporada_id': jogo.temporada_id });
            }

            timesNaTemporada.push(timeT);
        }

        return timesNaTemporada;
    }

}

module.exports = TimestemporadaServices;