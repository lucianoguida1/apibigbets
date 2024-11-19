const { Op } = require('sequelize');
const Controller = require('./Controller.js');
const LigaServices = require('../services/LigaServices.js');

const ligaServices = new LigaServices();

class LigasController extends Controller {
    async ligasForm(req, res) {
        try {
            const { search, paisesId, limit = 30, offset = 0 } = req.query;

            // Construir filtros dinamicamente
            const filters = {};
            if (search) {
                filters.nome = { [Op.iLike]: `%${search}%` };
            }
            if (paisesId) {
                const paisesIdArray = req.query.paisesId?.split(',').map(Number);
                filters.pai_id = { [Op.in]: paisesIdArray };
            }

            // Buscar registros com filtros aplicados e limite
            const ligas = await ligaServices.pegaTodosOsRegistros({
                where: filters,
                limit: parseInt(limit, 10),
                offset: parseInt(offset, 10),
            });

            return res.status(200).json({
                message: 'Ligas buscadas com sucesso!',
                data: ligas,
            });
        } catch (error) {
            return res.status(500).json({
                error: `Erro ao buscar as ligas: ${error.message}`,
            });
        }
    }
}

module.exports = LigasController;
