const Services = require('./Services.js');
const Regra = require('./RegravalidacoeServices.js');

const regraServices = new Regra();

class OddServices extends Services {
    
    constructor() {
        super('Odd');
    }

    async pegaOdd(tipoApostas, jogo, casaDeAposta, odds, regras) {
        const oddsDoJogo = await super.pegaTodosOsRegistros({ where: { 'jogo_id': jogo.id } });

        const novasOdds = [];
        const oddsParaAtualizar = [];

        for (const odd of odds) {
            const tipoAposta = tipoApostas.find(e => e.id_sports === odd.id);
            for (const value of odd.values) {
                let regra = regras.find(e => e.name == value.value && e.tipoaposta_id == tipoAposta.id);
                if (!regra) {
                    regra = regraServices.criaRegistro({
                        name: value.value,
                        tipoaposta_id: tipoAposta.id
                    });
                }
                const valorOdd = parseFloat(value.odd);

                const oddDoJogo = oddsDoJogo.find(e => String(e.nome) == value.value && e.tipoaposta_id == tipoAposta.id && regra.id == e.regra_id);

                if (oddDoJogo) {
                    if (valorOdd != oddDoJogo.odd) {
                        let novoCampo = 'odd_1';
                        let i = 1;
                        while (oddDoJogo.dados && oddDoJogo.dados.hasOwnProperty(novoCampo)) {
                            i++;
                            novoCampo = `odd_${i}`;
                        }
                        if (!oddDoJogo.dados) {
                            oddDoJogo.dados = {};
                        }
                        oddDoJogo.dados[novoCampo] = valorOdd;

                        oddsParaAtualizar.push({ id: oddDoJogo.id, odd: valorOdd, dados: oddDoJogo.dados });
                    }
                } else {
                    novasOdds.push({
                        'nome': String(value.value),
                        'odd': valorOdd,
                        'tipoaposta_id': tipoAposta.id,
                        'jogo_id': jogo.id,
                        'bet_id': casaDeAposta.id,
                        'regra_id': regra ? regra.id : null,
                        'dados': {
                            'odd_1': valorOdd
                        }
                    });
                }
            }
        }

        // Passo 3: Criar todas as novas odds de uma só vez
        if (novasOdds.length > 0) {
            await super.criaVariosRegistros(novasOdds);
        }

        // Passo 4: Atualizar todas as odds que foram modificadas de uma vez
        if (oddsParaAtualizar.length > 0) {
            await super.atualizaRegistrosEmMassa(oddsParaAtualizar);
        }
    }
}

module.exports = OddServices;
