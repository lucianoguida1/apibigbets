const Services = require('./Services.js');
const axios = require('axios');

class PaiServices extends Services {
    constructor(){
        super('Pai');
    }
    
}

module.exports = PaiServices;