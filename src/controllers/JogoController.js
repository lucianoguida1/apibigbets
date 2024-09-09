require('dotenv').config();
const Controller = require('./Controller.js');

class JogoController extends Controller {
    async jogosCompleto() {
        try {
            const startTime = new Date();  // Marca o início da execução
            logTo('Iniciando validação de regras odd');

            const modelosRelacionados = ['casa', 'fora', 'gol', 'odd'];
            const where = { data: { [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 1)) } };
            const limit = 30;  // Define o número de registros por página
            let offset = 0;
            let totalJogos = 0;

            // Loop para processar os jogos página por página
            let paginaJogos;
            do {
                // Busca a próxima página de jogos
                paginaJogos = await JogoServices.pegaTodosOsJogos(modelosRelacionados, where, limit, offset);
                console.log(paginaJogos.length);

                if (paginaJogos.length > 0) {
                    // Processa as odds da página atual
                    const oddsToUpdate = [];

                    for (const jogo of paginaJogos) {
                        if (jogo.Odds && jogo.Odds.length > 0) {
                            for (const odd of jogo.Odds) {
                                if (odd.regra && odd.regra.regra != null) {
                                    const funcaoValidacao = odd.regra.regra;
                                    const validar = new Function('jogo', funcaoValidacao);
                                    const novoStatus = validar(jogo) ? true : false;

                                    // Acumula as odds que precisam ser atualizadas
                                    oddsToUpdate.push({
                                        id: odd.id,
                                        status: novoStatus
                                    });
                                }
                            }
                        }
                    }

                    // Atualizar todas as odds da página de uma só vez
                    if (oddsToUpdate.length > 0) {
                        await Odd.bulkCreate(oddsToUpdate, {
                            updateOnDuplicate: ['status']  // Atualizar o campo status quando houver duplicata
                        });
                    }

                    totalJogos += paginaJogos.length;
                    logTo(`Processados ${paginaJogos.length} jogos da página, total até agora: ${totalJogos}.`);

                    // Incrementa o offset para a próxima página
                    offset += paginaJogos.length;
                }

            } while (paginaJogos.length > 0);  // Continua até que não haja mais jogos

            const endTime = new Date();  // Marca o fim da execução
            const executionTime = formatMilliseconds(endTime - startTime);

            logTo(`Finalizado validação de regras odd. Tempo de execução: ${executionTime}. Total de jogos processados: ${totalJogos}`);
        } catch (error) {
            logTo('Erro ao validar os jogos:', error.message);
            console.error('Erro ao validar os jogos:', error.message);
        }
    }
}

module.exports = JogoController;