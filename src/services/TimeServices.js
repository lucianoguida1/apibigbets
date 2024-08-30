const Services = require('./Services.js');

class TimeServices extends Services {
    constructor(){
        super('Time');
    }

    async pegaTime(time){
        let team = await super.pegaUmRegistro({where :{'id_sports': time.id}});
        if(team === null){
            team = super.criaRegistro({
                'nome': time.name,
                'logo': time.logo,
                'id_sports': time.id,
            });
        }
        return team;
    }
}

module.exports = TimeServices;