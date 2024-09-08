const Services = require('./Services.js');
const Regra = require('./RegravalidacoeServices.js');

const regraServices = new Regra();

class OddServices extends Services {
    constructor() {
        super('Odd');
    }
    async pegaOdd(tipoApostas, jogo, casaDeAposta, odds) {
        const oddsDoJogo = await super.pegaTodosOsRegistros({ 'jogo_id': jogo.id });
        const regras = await regraServices.pegaTodosOsRegistros();

        const novasOdds = [];
        const oddsParaAtualizar = [];

        for (const odd of odds) {
            const tipoAposta = tipoApostas.find(e => e.name === odd.name);
            for (const value of odd.values) {
                const regra = regras.find(e => e.nome === value.value);
                const valorOdd = parseFloat(value.odd);

                const oddDoJogo = oddsDoJogo.find(e => String(e.nome) == value.value && e.tipoaposta_id == tipoAposta.id);
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


    async pegaOdd_old(tipoAposta, jogo, casaDeAposta, odds) {
        // Passo 1: Buscar todos os odds do jogo e todas as regras de uma só vez
        const oddsDoJogo = await super.pegaTodosOsRegistros({ 'jogo_id': jogo.id, 'tipoaposta_id': tipoAposta.id });
        const regras = await regraServices.pegaTodosOsRegistros();

        // Arrays para armazenar os registros que serão criados e atualizados
        const novasOdds = [];
        const oddsParaAtualizar = [];

        // Passo 2: Processar os odds recebidos e comparar com os existentes
        for (const valor of odds.values) {
            let criaNovo = true;
            const valorOdd = parseFloat(valor.odd);

            for (const oddBanco of oddsDoJogo) {
                if (oddBanco.nome == String(valor.value)) {
                    criaNovo = false;
                    if (oddBanco.odd !== valorOdd) {
                        // Se a odd mudou, atualiza o valor em memória
                        oddBanco.odd = valorOdd;
                        oddsParaAtualizar.push({ id: oddBanco.id, odd: valorOdd }); // Armazena para ser atualizado mais tarde
                    }
                    break; // Sai do loop quando encontra a odd
                }
            }

            if (criaNovo) {
                let regra = regras.find(regra => regra.nome === String(valor.value) && regra.tipoaposta_id === tipoAposta.id)
                    || await regraServices.pegaRegra(String(valor.value), tipoAposta);

                // Armazena a nova odd a ser criada
                novasOdds.push({
                    'nome': String(valor.value),
                    'odd': valorOdd,
                    'tipoaposta_id': tipoAposta.id,
                    'jogo_id': jogo.id,
                    'bet_id': casaDeAposta.id,
                    'regra_id': regra ? regra.id : null
                });
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
