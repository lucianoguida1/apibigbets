const Controller = require('./Controller.js');
const DashboardServices = require('../services/DashboardServices.js');

const dashboardServices = new DashboardServices();

class DashboardController extends Controller {
    async lucroOntem(req, res) {
        try {
            const dados = await dashboardServices.pegaUmRegistro({ where: { nome: 'lucroOntem' } });

            if (!dados || !dados.dados_json) {
                return res.status(400).json({
                    status: "error",
                    message: "Nenhum dado encontrado para o lucro de ontem",
                    errorCode: 400,
                    data: []
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Dados de lucro de ontem recuperados com sucesso!",
                statusCode: 200,
                data: JSON.parse(dados.dados_json)
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "Erro interno ao buscar o lucro de ontem",
                errorCode: 500,
                details: error.message
            });
        }
    }
}

module.exports = DashboardController;