const Services = require('./Services.js');

class OddServices extends Services {
    constructor() {
        super('Odd');
    }

    async pegaOdd(tipoAposta, jogo, casaDeAposta, odds) {
        const oddsDoJogo = await super.pegaTodosOsRegistros({ 'jogo_id': jogo.id, 'tipoaposta_id': tipoAposta.id });
        if (oddsDoJogo.length > 0) {
            for (const valor of odds.values) {
                let criaNovo = true;
                const valorOdd = parseFloat(valor.odd);
                for (const oddBanco of oddsDoJogo) {
                    if (oddBanco.nome == String(valor.value)) {
                        criaNovo = false;
                        if (oddBanco.odd !== valorOdd) {
                            oddBanco.odd = valorOdd;
                            oddBanco.save();
                        }
                    }
                }
                if (criaNovo) {
                    const odd = await super.criaRegistro({
                        'nome': String(valor.value),
                        'odd': valorOdd,
                        'tipoaposta_id': tipoAposta.id,
                        'jogo_id': jogo.id,
                        'bet_id': casaDeAposta.id
                    });
                }
            }
        } else {
            for (const valor of odds.values) {
                const valorOdd = parseFloat(valor.odd);
                const odd = await super.criaRegistro({
                    'nome': String(valor.value),
                    'odd': valorOdd,
                    'tipoaposta_id': tipoAposta.id,
                    'jogo_id': jogo.id,
                    'bet_id': casaDeAposta.id
                });
            }
        }
        /*
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
                console.log(1)
                odd = await super.atualizaRegistro({
                    'odd': valorOdd
                }, {
                    'nome': String(valor.value),
                    'tipoaposta_id': tipoAposta.id,
                    'jogo_id': jogo.id,
                    'bet_id': casaDeAposta.id
                });
            }
        }
        return true;
        */
    }

}

module.exports = OddServices;