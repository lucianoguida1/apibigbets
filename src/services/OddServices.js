const Services = require('./Services.js');

class OddServices extends Services {
    constructor() {
        super('Odd');
    }

    async pegaOdd(tipoAposta, jogo, casaDeAposta, odds) {
        for (const valor of odds.values) {
            let odd = await super.pegaUmRegistro({
                where: {
                    'nome': String(valor.value),
                    'tipoaposta_id': tipoAposta.id,
                    'jogo_id': jogo.id,
                    'bet_id': casaDeAposta.id
                }
            });
    
            const valorOdd = parseFloat(valor.odd);
            
            if (!odd) {
                odd = await super.criaRegistro({
                    'nome': String(valor.value),
                    'odd': valorOdd,
                    'tipoaposta_id': tipoAposta.id,
                    'jogo_id': jogo.id,
                    'bet_id': casaDeAposta.id
                });
            } else if (odd.odd !== valorOdd) {
                console.log((odd.odd !== valorOdd));
                odd = await super.atualizaRegistro({
                    'odd': valorOdd
                },
                {
                    'nome': String(valor.value),
                    'tipoaposta_id': tipoAposta.id,
                    'jogo_id': jogo.id,
                    'bet_id': casaDeAposta.id
                });
            }
        }
        return true;
    }
    
}

module.exports = OddServices;