const Services = require('./Services.js');

class GolServices extends Services {
    constructor() {
        super('Gol');
    }
    async adicionaGols(scores, jogo) {
        let gols = null;

        if ('id' in jogo) {
            gols = await super.pegaTodosOsRegistros({ 'jogo_id': jogo.id });
        }
        // Caso não existam registros, cria novos
        if (gols != null) {
            if (gols.length <= 0) {
                for (const period in scores) {
                    if (scores.hasOwnProperty(period)) {
                        const score = scores[period];
                        const gol = {
                            tempo: period,
                            casa: score.home,
                            fora: score.away,
                            jogo_id: jogo.id
                        }
                        await super.criaRegistro(gol);
                    }
                }
            } else {
                // Atualiza os registros existentes
                for (const period in scores) {
                    if (scores.hasOwnProperty(period)) {
                        const score = scores[period];

                        // Encontra o registro existente correspondente ao período
                        let registroExistente = gols.find(g => g.tempo === period);

                        // Se o registro existir, atualiza, caso contrário, cria um novo
                        if (registroExistente) {
                            registroExistente.casa = score.home;
                            registroExistente.fora = score.away;
                            await registroExistente.save();
                        } else {
                            const novoGol = {
                                tempo: period,
                                casa: score.home,
                                fora: score.away,
                                jogo_id: jogo.id
                            }
                            await super.criaRegistro(novoGol);
                        }
                    }
                }
            }
        }
    }

}

module.exports = GolServices;