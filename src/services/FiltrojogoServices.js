const Services = require('./Services.js');
const { Filtrojogo, Regra, Estrategia, sequelize } = require('../database/models');

class FiltrojogoServices extends Services {
    constructor() {
        super('Filtrojogo');
    }

    async getFiltrosJogos(opitions = {}) {
        const rawResult = await sequelize.query(
            `select fj.id,fj.nome,fj.casa,fj.fora,count(r.id) as total_regras,e.id as estrategia_id,e.nome as nome_estrategia,e.lucro_total,e.taxaacerto from filtrojogos fj
            left join regras r on fj.id = ANY(string_to_array(r.filtrojogo_ids, ',')::int[])
            left join estrategias e on e.id = r.estrategia_id
            where fj."deletedAt" is null
            ${opitions.geral ? `and (casa = true and fora = true)`:``}
            ${opitions.casa ? `and (casa = true and fora = false)`:``}
            ${opitions.fora ? `and (casa = false and fora = true)`:``}
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

    async deleteFiltroJogo(id) {
        const associatedRules = await Regra.count({
            where: { filtrojogo_id: id }
        });

        if (associatedRules > 0) {
            throw new Error('O filtro jogo não pode ser excluído porque está associado a uma ou mais regras.');
        }

        const result = await super.excluiRegistro(id);
        console.log('associatedRules', result)
        return result;
    }
}
module.exports = FiltrojogoServices;