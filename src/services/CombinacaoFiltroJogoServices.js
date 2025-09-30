const Services = require('./Services.js');
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

            return { count, rows };

        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = CombinacaofiltrojogoServices;