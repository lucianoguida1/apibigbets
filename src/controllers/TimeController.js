const Controller = require('./Controller.js');
const TimeServices = require('../services/TimeServices.js');

const timeServices = new TimeServices();
const { Sequelize, Op } = require('sequelize');

class TimeController extends Controller {
    async searchTime(req, res) {
        try {
            const { search, page = 1, pageSize = 30 } = req.query;
            // Construir filtros dinamicamente
            const filters = {};
            if (search) {
                filters.nome = { [Op.iLike]: `%${search}%` };
            }
            // Buscar registros com filtros aplicados e limite
            const { count, rows: times } = await timeServices.pegaEContaRegistros({
                where: { ...filters },
                order: [[Sequelize.literal("(dados_json->>'num_jogos')::int"), 'DESC']],
                limit: parseInt(pageSize, 10),
                offset: parseInt((page - 1) * pageSize)
            });
            if (times.length == 0) {
                return res.status(400).json({
                    "status": "error",
                    "message": "Não foi encontrado nenhum time",
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
            const data = times.map(time => {
                return {
                    value: time.id.toString(),
                    label: time.nome
                }
            });
            return res.status(200).json({
                "status": "success",
                "message": "Times buscados com sucesso!",
                "statusCode": 200,
                "pagination": {
                    "page": parseInt(page, 10),
                    "totalPages": Math.ceil(count / pageSize),
                    "totalItems": times.length,
                    "totalRegistro": count
                },
                data: data
            });
        } catch (error) {
            return res.status(500).json({
                "status": "error",
                "message": "Erro ao buscar times",
                "errorCode": 500,
                "error": error.message
            });
        }
    }
}

module.exports = TimeController;