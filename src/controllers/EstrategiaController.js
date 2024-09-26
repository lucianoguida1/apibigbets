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
            let jogos = {};
            if (regras.length > 0) {
                for (const regra of regras) {
                    jogos[regra.id] = await jogoServices.filtrarJogosPorRegra(regra);
                }
                return res.status(200).json(jogos);
            }

            return res.status(404).json({ error: 'Estratégia não contem regras!' });
        } catch (error) {
            console.error('Erro ao executar estratégia:', error);
            return res.status(500).json({ error: 'Erro ao executar estratégia: ' + error.message });
        }
    }
}

module.exports = EstrategiaController;
