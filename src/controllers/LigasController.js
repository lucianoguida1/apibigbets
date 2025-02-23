const { Op, Sequelize } = require('sequelize');
const Controller = require('./Controller.js');
const LigaServices = require('../services/LigaServices.js');

const ligaServices = new LigaServices();

class LigasController extends Controller {
    async getLigas(req, res) {
        try {
            const { search, paisesId, ids, page = 1, pageSize = 30 } = req.query;
            // Construir filtros dinamicamente
            const filters = {};
            if (search) {
                filters.nome = { [Op.iLike]: `%${search}%` };
            }
            if (paisesId) {
                const paisesIdArray = req.query.paisesId?.split(',').map(Number);
                filters.pai_id = { [Op.in]: paisesIdArray };
            }
            if (ids) {
                const ids = req.query.ids?.split(',').map(Number);
                filters.id = { [Op.in]: ids };
            }

            // Buscar registros com filtros aplicados e limite
            const { count, rows: ligas } = await ligaServices.pegaEContaRegistros({
                where: { ...filters, dados_json: { [Op.ne]: null } },
                order: [[Sequelize.literal("(dados_json->>'num_jogos')::int"), 'DESC']],
                limit: parseInt(pageSize, 10),
                offset: parseInt((page - 1) * pageSize),
            });
            if (ligas.length == 0) {
                return res.status(400).json({
                    "status": "error",
                    "message": "Não foi encontrado nenhuma liga",
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
                "message": "Ligas buscadas com sucesso!",
                "statusCode": 200,
                "pagination": {
                    "page": parseInt(page, 10),
                    "totalPages": Math.ceil(count / pageSize),
                    "totalItems": ligas.length,
                    "totalRegistro": count
                },
                data: ligas
            });
        } catch (error) {
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao buscar ligas",
                "errorCode": 500,
                "details": error.message
            });
        }
    }
}

module.exports = LigasController;
