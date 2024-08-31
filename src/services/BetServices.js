const Services = require('./Services.js');

class BetServices extends Services {
    constructor(){
        super('Bet');
    }

    async pegaBet(bet){
        let casa = await super.pegaUmRegistro({where: {'id_sports': bet.id}});
        if(!casa){
            casa = super.criaRegistro({
                'nome': bet.name,
                'id_sports': bet.id
            });
        }
        return casa;
    }
}

module.exports = BetServices;