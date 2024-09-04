const Services = require('./Services.js');

class RequisicaopendenteServices extends Services {
    constructor(){
        super('requisicaopendente');
    }

    async pegaPendente(modulo){
        let reqPen = await super.pegaUmRegistro({where: {'modulo': modulo}});
        if(!reqPen){
            reqPen = await super.criaRegistro({'modulo': modulo,'pagina': 1});
        }
        return reqPen;
    }
}

module.exports = RequisicaopendenteServices;