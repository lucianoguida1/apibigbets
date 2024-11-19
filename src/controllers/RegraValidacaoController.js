const { Op } = require('sequelize');
const Controller = require('./Controller.js');
const RegravalidacoeServices = require('../services/RegravalidacoeServices.js');
const regrasServices = new RegravalidacoeServices();

class RegraValidacaoController extends Controller {
    constructor() {
        super(regrasServices);
    }

    async regrasvalidacaoform(req, res) {
        try {
            const { search, limit = 30, offset = 0 } = req.query;

            // Construir filtros dinamicamente
            const filters = {};
            if (search) {
                filters.nome = { [Op.iLike]: `%${search}%` }; // Busca nomes que contenham 'search'
            }

            // Buscar registros com filtros aplicados e limites definidos
            const regras = await regrasServices.getRegrasValidacao();

            const formatado = regras.map(regra => ({
                id: regra.id,
                nome: `${regra.Tipoapostum.nome || regra.Tipoapostum.name} - ${regra.nome}`
            }))
            return res.status(200).json({
                message: 'Regras buscados com sucesso!',
                data: formatado,
            });
        } catch (error) {
            return res.status(500).json({
                error: `Erro ao buscar os Regras: ${error.message}`,
            });
        }
    }
}

module.exports = RegraValidacaoController;