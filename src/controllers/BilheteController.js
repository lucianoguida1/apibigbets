const Controller = require('./Controller.js');
const BilheteServices = require('../services/BilheteServices.js');

const bilheteServices = new BilheteServices();

class BilheteController extends Controller {
    async getBilhetesHoje(req, res) {
        try {
            const dados = await bilheteServices.getBilhetesHoje();

            if (!dados) {
                return res.status(400).json({
                    status: "error",
                    message: "Nenhum dado encontrado para hoje",
                    errorCode: 400,
                    data: []
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Bilhetes recuperados com sucesso!",
                statusCode: 200,
                data: (dados)
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "Erro interno ao buscar os dados de hoje",
                errorCode: 500,
                details: error.message
            });
        }
    }
}

module.exports = BilheteController;