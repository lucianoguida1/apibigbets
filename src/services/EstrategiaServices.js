const { Op, Sequelize } = require('sequelize');
const Services = require('./Services.js');
const { Regra } = require('../database/models');

class EstrategiaServices extends Services {
    constructor() {
        super('Estrategia');
    }

    
    async getTopEstrategia() {
        const estrategia = await super.pegaUmRegistro({
            where: { taxaacerto: { [Op.ne]: null } },
            order: [['taxaacerto', 'DESC']],
            include: {
                model: Regra,
                require: true,
            }
        });
        return estrategia;
    }
}

module.exports = EstrategiaServices;