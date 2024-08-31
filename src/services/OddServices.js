const Services = require('./Services.js');

class OddServices extends Services {
    constructor() {
        super('Odd');
    }

    async pegaOdd(tipoAposta, jogo, casaDeAposta, odds) {
        for (const valor of odds.values) {
            let odd = await super.pegaUmRegistro({
                where: {
                    'nome': valor.value,
                    'tipoaposta_id': tipoAposta.id,
                    'jogo_id': jogo.id,
                    'bet_id': casaDeAposta.id
                }
            });
            if (!odd) {
                odd = await super.criaRegistro({
                    'nome': valor.value,
                    'odd': valor.odd,
                    'tipoaposta_id': tipoAposta.id,
                    'jogo_id': jogo.id,
                    'bet_id': casaDeAposta.id
                });
            } else if(odd.odd != valor.odd) {
                odd = await super.atualizaRegistro({
                    'odd': valor.odd
                },
                    {
                        'nome': valor.value,
                        'tipoaposta_id': tipoAposta.id,
                        'jogo_id': jogo.id,
                        'bet_id': casaDeAposta.id
                    }
                );
            }
        }
        return true;
    }
}

module.exports = OddServices;