const { Op, where } = require('sequelize'); // Importando os operadores do Sequelize
const Controller = require('./Controller.js');
const EstrategiaServices = require('../services/EstrategiaServices.js');
const JogoServices = require('../services/JogoServices.js');


const estrategiaServices = new EstrategiaServices();
const jogoServices = new JogoServices();

class EstrategiaController extends Controller {
    constructor() {
        super(estrategiaServices);
    }

    async getTopEstrategia(req, res) {
        try {
            const estrategia = await estrategiaServices.pegaUmRegistro({
                order: [
                    ['taxaacerto', 'DESC']
                ]
            });
            if (!estrategia) {
                return res.status(404).json({ error: 'Estratégia não encontrada!' });
            }

            return res.status(200).json(estrategia);
        } catch (error) {
            console.error('Erro ao executar estratégia:', error);
            return res.status(500).json({ error: 'Erro ao buscar estratégia: ' + error.message });
        }
    }

    async executarEstrategia(req, res) {
        try {
            if (!req.params.id) {
                return res.status(400).json({ error: 'ID da estratégia não fornecido!' });
            }

            const estrategia = await estrategiaServices.pegaUmRegistroPorId(req.params.id);
            if (!estrategia) {
                return res.status(404).json({ error: 'Estratégia não encontrada!' });
            }

            const regras = await estrategia.getRegras();
            let apostas = {};
            let erros = 0;
            let acertos = 0;

            if (regras.length > 0) {
                const jogosUnicos = {};

                for (const regra of regras) {
                    const jogosFiltrados = await jogoServices.filtrarJogosPorRegra(regra);

                    jogosFiltrados.forEach((jogo) => {
                        if (!jogosUnicos[jogo.id]) {
                            jogosUnicos[jogo.id] = jogo;
                        }
                    });
                }
                const jogosArray = Object.values(jogosUnicos);
                jogosArray.sort((a, b) => new Date(b.datahora) - new Date(a.datahora));
                if (jogosArray.length > 0) {
                    let i = 1;
                    for (const jogo of jogosArray) {
                        if (!apostas[i]) {
                            apostas[i] = {
                                odd: 1,
                                status: true,
                                jogos: []
                            };
                        }
                        apostas[i]['jogos'].push(jogo);
                        apostas[i]['odd'] = apostas[i]['odd'] * jogo.odd;
                        if (apostas[i]['jogos'].length >= regras.length) {
                            // Verifica o status de cada jogo dentro da aposta
                            for (const jogoo of apostas[i].jogos) {
                                if (jogoo.statusOdd == false || !jogoo.statusOdd) {
                                    apostas[i].status = false;
                                }
                            }
                            if (apostas[i].status) {
                                acertos++;
                            } else {
                                erros++;
                            }
                            // Incrementa o índice `i` para a próxima aposta
                            i++;
                        }
                    }
                    estrategia.totalacerto = acertos;
                    estrategia.totalerro = erros;
                    estrategia.taxaacerto = ((acertos / (acertos + erros)) * 100).toFixed(2);
                    estrategia.save();
                    return res.status(200).json(apostas);

                } else {
                    return res.status(404).json({ menssagem: "Nenhum jogo encontrado!" });
                }
            }
            return res.status(404).json({ error: 'Estratégia não contém regras!' });
        } catch (error) {
            console.error('Erro ao executar estratégia:', error);
            return res.status(500).json({ error: 'Erro ao executar estratégia: ' + error.message });
        }
    }


}

module.exports = EstrategiaController;
