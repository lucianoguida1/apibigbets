const { Op, Sequelize } = require('sequelize');
const Controller = require('./Controller.js');
const JogoServices = require('../services/JogoServices.js');

const jogoServices = new JogoServices();

class JogosController extends Controller {
    async getJogosSemPlacar(req, res) {
        try {
            const { count, rows } = await jogoServices.jogosSemPlacar();
            return res.status(200).json({
                "status": "success",
                "message": "Dados retornados com sucesso!",
                "statusCode": 200,
                "pagination": {},
                "data": {
                    "count": count,
                    "rows": rows
                }
            });
        } catch (error) {
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao buscar dados",
                "errorCode": 500,
                "details": error.message
            });
        }
    }

}

module.exports = JogosController;