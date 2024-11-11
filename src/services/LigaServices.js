const { Op, Sequelize } = require('sequelize');
const Services = require('./Services.js');
const PaiServices = require('../services/PaiServices.js');
const TemporadaServices = require('./TemporadaServices.js');
const { Jogo, Liga, Temporada, sequelize } = require('../database/models');

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

    async getLigasForm() {
        const sql = `
            SELECT l.id, l.nome, l.logo, COUNT(j.id) AS totalJogos
            FROM ligas l
            INNER JOIN temporadas t ON t.liga_id = l.id
            INNER JOIN jogos j ON j.temporada_id = t.id
            GROUP BY l.id, l.nome, l.logo
            HAVING COUNT(j.id) > 50
            ORDER BY totalJogos DESC
            LIMIT 20;
        `;

        try {
            const results = await sequelize.query(sql, {
                type: sequelize.QueryTypes.SELECT,
            });

            return results;
        } catch (error) {
            console.error('Erro ao buscar as top 20 ligas:', error);
            throw error;
        }
    }
}
module.exports = LigaServices;