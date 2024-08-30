const Services = require('./Services.js');

class TemporadaServices extends Services {
    constructor(){
        super('Temporada');
    }
    async pegaTemporada(league, liga){
        let temporada = await super.pegaUmRegistro({where: {'id': liga.id,'ano': league.season}});
        if(temporada === null){
            temporada = await super.criaRegistro({
                'ano': league.season,
                'liga_id': liga.id
            });
        }
        return temporada;
    }
}

module.exports = TemporadaServices;