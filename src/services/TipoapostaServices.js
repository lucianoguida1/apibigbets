const Services = require('./Services.js');

class TipoapostaServices extends Services {
    constructor() {
        super('Tipoaposta');
    }

    async pegaTipoAposta(bet) {
        let tipoAposta = await super.pegaUmRegistro({ where: { 'id_sports': bet.id } });
        if (!tipoAposta) {
            tipoAposta = await super.criaRegistro({
                'name': tipo.name,
                'id_sports': tipo.id
            });
        }
        return tipoAposta;
    }
}

module.exports = TipoapostaServices;