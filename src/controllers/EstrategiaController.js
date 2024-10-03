const { Op } = require('sequelize'); // Importando os operadores do Sequelize
const Controller = require('./Controller.js');
const Services = require('../services/Services.js');
const EstrategiaServices = require('../services/EstrategiaServices.js');
const JogoServices = require('../services/JogoServices.js');


const estrategiaServices = new EstrategiaServices();
const jogoServices = new JogoServices();

class EstrategiaController extends Controller {
    constructor() {
        super(estrategiaServices);
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
            if (regras.length > 0) {
                for (const regra of regras) {
                    const jogos = await jogoServices.filtrarJogosPorRegra(regra);
                    if (regra.multipla > 1) {
                        if (!apostas[regra.id]) {
                            apostas[regra.id] = {};
                        }
                        let i = 1;
                        for (const jogo of jogos) {
                            // Verifica se `apostas[regra.id][i]` já existe, senão inicializa
                            if (!apostas[regra.id][i]) {
                                apostas[regra.id][i] = {
                                    odd: 1,
                                    status: true,
                                    jogos: []
                                };
                            }
                            apostas[regra.id][i]['jogos'].push(jogo);
                            apostas[regra.id][i]['odd'] = apostas[regra.id][i]['odd'] * jogo.odd;
                            if (apostas[regra.id][i]['jogos'].length >= regra.multipla) {
                                for (const jogoo of apostas[regra.id][i].jogos) {
                                    if (!jogoo.statusOdd) {
                                        apostas[regra.id][i].status = false;
                                    }
                                }
                                i++;
                            }
                        }
                    } else {
                        apostas[regra.id] = jogos;
                    }
                }
                return res.status(200).json(apostas);
            }

            return res.status(404).json({ error: 'Estratégia não contem regras!' });
        } catch (error) {
            console.error('Erro ao executar estratégia:', error);
            return res.status(500).json({ error: 'Erro ao executar estratégia: ' + error.message });
        }
    }
}

module.exports = EstrategiaController;
