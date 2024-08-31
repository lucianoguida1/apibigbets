const Services = require('./Services.js');
const PaiServices = require('../services/PaiServices.js');
const TemporadaServices = require('./TemporadaServices.js');

const paiServices = new PaiServices();
const temporadaServices = new TemporadaServices();

class LigaServices extends Services {
    constructor() {
        super('Liga');
    }

    async pegaLiga(league) {
        let liga = await super.pegaUmRegistro({ where: { id_sports: league.id } });
        if (!liga) {
            let pais = await paiServices.pegaUmRegistro({ where: { nome: league.country } })
            if (!pais) {
                pais = await paiServices.criaRegistro({ nome: league.country })
            }

            liga = await super.criaRegistro({
                nome: league.name,
                logo: league.logo,
                id_sports: league.id,
                pai_id: parseInt(pais.id)
            });
        }
        const temporada = await temporadaServices.pegaTemporada(league, liga);

        return liga;
    }/// fim do metedo adiconaLiga
}

module.exports = LigaServices;