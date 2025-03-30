const Services = require('./Services.js');
const { Filtrojogo, Regra, Estrategia, sequelize } = require('../database/models');

class FiltrojogoServices extends Services {
    constructor() {
        super('Filtrojogo');
    }

    async getFiltrosJogos(opitions = {}) {
        const rawResult = await sequelize.query(
            `select fj.id,fj.nome,fj.casa,fj.fora,count(r.id) as total_regras,e.id as estrategia_id,e.nome as nome_estrategia,e.lucro_total,e.taxaacerto from filtrojogos fj
            left join regras r on r.filtrojogo_id = fj.id
            left join estrategias e on e.id = r.estrategia_id
            group by fj.id,fj.nome,fj.casa,fj.fora,e.nome,e.lucro_total,e.taxaacerto,e.id
            ${opitions.limit ? `LIMIT ${opitions.limit}` : ''}
            ${opitions.offset ? `OFFSET ${opitions.offset}` : ''}`,
            { type: sequelize.QueryTypes.SELECT }
        );

        const groupedResult = rawResult.reduce((acc, item) => {
            const { id, nome, casa, fora, total_regras, estrategia_id, nome_estrategia, lucro_total, taxaacerto } = item;

            if (!acc[id]) {
                acc[id] = {
                    id,
                    nome,
                    casa,
                    fora,
                    total_regras,
                    estrategias: []
                };
            }

            acc[id].estrategias.push({
                estrategia_id,
                nome_estrategia,
                lucro_total,
                taxaacerto
            });

            return acc;
        }, {});

        return Object.values(groupedResult);
    }
}
module.exports = FiltrojogoServices;