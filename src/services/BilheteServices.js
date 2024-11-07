const Services = require('./Services.js');
const { Bilhete } = require('../database/models');

class BilheteServices extends Services {
    constructor() {
        super('Bilhete');
    }

    async maxId() {
        return await Bilhete.max('bilhete_id');
    }
}

module.exports = BilheteServices;