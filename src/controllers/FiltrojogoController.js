const { Op, Sequelize } = require('sequelize');
const Controller = require('./Controller.js');
const Filtrojogos = require('../services/FiltrojogoServices.js');
const { sequelize } = require('../database/models');

const filtrojogos = new Filtrojogos();

class FiltrojogoController extends Controller {
    async createFiltroJogo(req, res) {
        try {
            const { nome, sql, ambos_times } = req.body;

            if (!nome || !sql) {
                return res.status(400).json({
                    "status": "error",
                    "message": "Nome e SQL são obrigatórios",
                    "errorCode": 400
                });
            }

            // Buscar registros com filtros aplicados e limite
            const filtrojogo = await filtrojogos.criaRegistro({ nome, sql, ambos_times });

            if (sql.includes('@data')) {
                const startDate = new Date('2024-09-26');
                const endDate = new Date();
                const dados_json = {};

                for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
                    const formattedDate = d.toISOString().split('T')[0];
                    let sqlF = sql.replace(/@data/g, `'${formattedDate}'`);
                    sqlF = sqlF.replace(/@filtrojogoid/g, `'${filtrojogo.id}'`);

                    const results = await sequelize.query(sqlF, {
                        type: sequelize.QueryTypes.SELECT,
                    });
                    dados_json[formattedDate] = results;
                }

                //filtrojogo.dados_json = dados_json;
                //await filtrojogo.save();
            }

            if (!filtrojogo) {
                return res.status(400).json({
                    "status": "error",
                    "message": "Não foi possivel criar o filtro de jogo",
                    "errorCode": 400,
                    "pagination": {}
                });
            }

            return res.status(201).json({
                "status": "success",
                "message": "filtro de jogos criado com sucesso!",
                "statusCode": 201,
                "pagination": {},
                data: filtrojogo
            });
        } catch (error) {
            console.error('Erro ao criar filtro de jogo:', error);
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao criar filtro de jogo",
                "errorCode": 500,
                "details": error.message
            });
        }
    }
}

module.exports = FiltrojogoController;
