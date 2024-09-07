require('dotenv').config();
const Controller = require('./Controller.js');
const JogoServices = require('../services/JogoServices.js');
const logTo = require('../utils/logTo.js');

class ServicesBaseController extends Controller {

    async validaRegras() {
        try {
            const modelosRelacionados = ['casa', 'fora', 'gol', 'odd'];
            const jogos = await JogoServices.pegaTodosOsJogos(modelosRelacionados);

            for (const jogo of jogos) {
                const jogoJSON = jogo.toJSON();
                if (jogo.Odds && jogo.Odds.length > 0) {
                    for (const odd of jogo.Odds) {
                        if (odd.regra && odd.regra.regra != null) {
                            const funcaoValidacao = odd.regra.regra;
                            const validar = new Function('jogo', funcaoValidacao);
                            if (validar(jogo)) {
                                odd.status = true;
                            } else {
                                odd.status = false;
                            }

                            try {
                                await odd.save();
                            } catch (error) {
                                logTo(`Erro ao salvar a odd ${odd.id}:`, error.mensage);
                                console.error(`Erro ao salvar a odd ${odd.id}:`, error.mensage);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            logTo('Erro ao exibir os jogos:', error.mensage);
            console.error('Erro ao exibir os jogos:', error.mensage);
        }
    }
}

module.exports = ServicesBaseController;
