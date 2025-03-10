const Services = require('./Services.js');
const { Filtrojogo } = require('../database/models');

class FiltrojogoServices extends Services {
    constructor(){
        super('Filtrojogo');
    }

    async getFiltrosJogos() {
        return Filtrojogo.findAll({
            attributes: { exclude: ["sql","updatedAt","deletedAt"] },
        });
    }

}

module.exports = FiltrojogoServices;