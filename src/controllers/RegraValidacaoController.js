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
            const { count, rows: regras } = await regrasServices.getRegrasValidacao();
            
            if (regras.length == 0) {
                return res.status(400).json({
                    "status": "error",
                    "message": "Não foi encontrada nenhuma regra de validação",
                    "errorCode": 400,
                    "pagination": {
                        "page": parseInt(offset / limit) + 1,
                        "totalPages": 0,
                        "totalItems": 0,
                        "totalRegistro": 0
                    },
                    data: []
                });
            }

            const formatado = regras.map(regra => ({
                id: regra.id,
                nome: `${regra.Tipoapostum.nome || regra.Tipoapostum.name} - ${regra.nome}`
            }));

            return res.status(200).json({
                "status": "success",
                "message": "Regras buscadas com sucesso!",
                "statusCode": 200,
                "pagination": {
                    "page": parseInt(offset / limit) + 1,
                    "totalPages": Math.ceil(regras.length / limit),
                    "totalItems": formatado.length,
                    "totalRegistro": count
                },
                data: formatado
            });
        } catch (error) {
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao buscar regras de validação",
                "errorCode": 500,
                "details": error.message
            });
        }
    }
}

module.exports = RegraValidacaoController;