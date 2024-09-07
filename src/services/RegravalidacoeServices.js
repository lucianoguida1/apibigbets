const logTo = require('../utils/logTo.js');
const Services = require('./Services.js');

class RegravalidacoeServices extends Services {
    constructor() {
        super('Regravalidacoe');
    }

    async pegaRegra(nome,tipoAposta) {
        try {
            let regra = await super.pegaUmRegistro({where: {'nome': nome, 'tipoaposta_id': tipoAposta.id}});
            if(!regra){
                regra = await super.criaRegistro({'nome': nome, 'tipoaposta_id': tipoAposta.id});
            }
            return regra;
        } catch (error) {
            logTo(error.message);
            console.log(error);
        }
    }
}


module.exports = RegravalidacoeServices;