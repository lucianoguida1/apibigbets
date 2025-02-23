const { Op, Sequelize } = require('sequelize');
const Controller = require('./Controller.js');
const PaiServices = require('../services/PaiServices.js');

const paiServices = new PaiServices();

class PaisController extends Controller {
    async getPais(req, res) {
        try {
            const { search, ids, page = 1, pageSize = 30 } = req.query;

            // Construir filtros dinamicamente
            const filters = {};
            if (search) {
                filters.nome = { [Op.iLike]: `%${search}%` };
            }
            if (ids) {
                const ids = req.query.ids?.split(',').map(Number);
                filters.id = { [Op.in]: ids };
            }

            // Buscar registros com filtros aplicados e limite
            const { count, rows: paises } = await paiServices.pegaEContaRegistros({
                where: { ...filters, dados_json: { [Op.ne]: null } },
                order: [[Sequelize.literal("(dados_json->>'num_jogos')::int"), 'DESC']],
                limit: parseInt(pageSize, 10),
                offset: parseInt((page - 1) * pageSize),
            });
            if (paises.length == 0) {
                return res.status(400).json({
                    "status": "error",
                    "message": "Não foi encontrado nenhum país",
                    "errorCode": 400,
                    "pagination": {
                        "page": parseInt(page, 10),
                        "totalPages": 0,
                        "totalItems": 0,
                        "totalRegistro": 0
                    },
                    data: []
                });
            }

            return res.status(200).json({
                "status": "success",
                "message": "Países buscados com sucesso!",
                "statusCode": 200,
                "pagination": {
                    "page": parseInt(page, 10),
                    "totalPages": Math.ceil(count / pageSize),
                    "totalItems": paises.length,
                    "totalRegistro": count
                },
                data: paises
            });
        } catch (error) {
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao buscar países",
                "errorCode": 500,
                "details": error.message
            });
        }
    }
}

module.exports = PaisController;
