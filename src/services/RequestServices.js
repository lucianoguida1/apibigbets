const Services = require('./Services.js');
const isHoje = require('../utils/isHoje.js');

class RequestServices extends Services {
    constructor(){
        super('Request');
    }


    async podeRequisitar() {
        // Pega o registro mais recente
        const request = await super.pegaUmRegistro({
            order: [['createdAt', 'DESC']]
        });
        
        // Se há um registro e foi criado hoje, verifica o consumo
        if (request && isHoje(request.createdAt)) {
            if (request.consumido < request.limite) {
                // Incrementa o consumo e salva o registro
                await request.update({ consumido: request.consumido + 1 });
                return true;
            }
            // Caso tenha excedido o limite
            return false;
        }
    
        // Se não há um registro válido para hoje, cria um novo
        await super.criaRegistro();
        return true;
    }
}

module.exports = RequestServices;