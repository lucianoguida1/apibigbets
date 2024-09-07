require('dotenv').config();
const Controller = require('./Controller.js');
const JogoServices = require('../services/JogoServices.js');
const logTo = require('../utils/logTo.js');
const { Op } = require('sequelize');
const { Odd } = require('../database/models');  // Certifique-se de importar o modelo Odd
const formatMilliseconds = require('../utils/formatMilliseconds.js');

class ServicesBaseController extends Controller {

    async validaRegras() {
        try {
            const startTime = new Date();  // Marca o início da execução

            const modelosRelacionados = ['casa', 'fora', 'gol', 'odd'];
            const where = { data: { [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 1)) } };
            const jogos = await JogoServices.pegaTodosOsJogos(modelosRelacionados,where);
            logTo('Iniciando validação de regras odd');

            const oddsToUpdate = [];  // Acumular as atualizações

            for (const jogo of jogos) {
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

            // Atualizar todas as odds de uma vez
            if (oddsToUpdate.length > 0) {
                await Odd.bulkCreate(oddsToUpdate, {
                    updateOnDuplicate: ['status']  // Atualizar o campo status quando houver duplicata
                });
            }

            const endTime = new Date();  // Marca o fim da execução
            const executionTime = formatMilliseconds((endTime - startTime) / 1000);  // Calcula o tempo em segundos

            logTo(`Finalizado validação de regras odd. Tempo de execução: ${executionTime} segundos.`);
        } catch (error) {
            logTo('Erro ao validar os jogos:', error.message);
            console.error('Erro ao validar os jogos:', error.message);
        }
    }
}

module.exports = ServicesBaseController;
