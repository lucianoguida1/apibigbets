const Services = require('./Services.js');
const { fn, col } = require("sequelize");
const { Combinacaofiltrojogo } = require('../database/models');

class CombinacaofiltrojogoServices extends Services {
    constructor() {
        super('Combinacaofiltrojogo');
    }
    async getCombinacoes(page = 1, pageSize = 5) {
        try {
            const { count, rows } = await Combinacaofiltrojogo.findAndCountAll({
                limit: pageSize,
                offset: (page - 1) * pageSize,
                order: [['lucro', 'DESC']],
                attributes: {
                    exclude: ["updatedAt"]
                }
            });

            // pega min e max de createdAt
            const extremos = await Combinacaofiltrojogo.findOne({
                attributes: [
                    [fn('MIN', col('createdAt')), 'minCreatedAt'],
                    [fn('MAX', col('createdAt')), 'maxCreatedAt']
                ],
                raw: true
            });

            // calcula diferença em minutos
            let diffMinutos = null;
            if (extremos.minCreatedAt && extremos.maxCreatedAt) {
                const minDate = new Date(extremos.minCreatedAt);
                const maxDate = new Date(extremos.maxCreatedAt);
                diffMinutos = Math.floor((maxDate - minDate) / (1000 * 60));
            }

            return {
                count,
                rows,
                minCreatedAt: extremos.minCreatedAt,
                maxCreatedAt: extremos.maxCreatedAt,
                diffMinutos
            };

        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = CombinacaofiltrojogoServices;