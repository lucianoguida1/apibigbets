const Services = require('./Services.js');
const Regra = require('./RegravalidacoeServices.js');

const regraServices = new Regra();

class OddServices extends Services {
    constructor() {
        super('Odd');
    }
    async pegaOdd(tipoApostas, jogo, casaDeAposta, odds, regras) {
        const oddsDoJogo = await super.pegaTodosOsRegistros({ 'jogo_id': jogo.id });

        const novasOdds = [];
        const oddsParaAtualizar = [];

        for (const odd of odds) {
            const tipoAposta = tipoApostas.find(e => e.id_sports === odd.id);
            for (const value of odd.values) {
                let regra = regras.find(e => e.nome == value.value && e.tipoaposta_id == tipoAposta.id);
                if (!regra) {
                    regra = regraServices.criaRegistro({
                        nome: value.value,
                        tipoaposta_id: tipoAposta.id
                    });
                }
                const valorOdd = parseFloat(value.odd);

                const oddDoJogo = oddsDoJogo.find(e => String(e.nome) == value.value && e.tipoaposta_id == tipoAposta.id && regra.id == e.regra_id);
                if (oddDoJogo) {
                    if (valorOdd != oddDoJogo.odd) {
                        oddsParaAtualizar.push({ id: oddDoJogo.id, odd: valorOdd }); // Armazena para ser atualizado mais tarde
                    }
                } else {
                    novasOdds.push({
                        'nome': String(value.value),
                        'odd': valorOdd,
                        'tipoaposta_id': tipoAposta.id,
                        'jogo_id': jogo.id,
                        'bet_id': casaDeAposta.id,
                        'regra_id': regra ? regra.id : null
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
