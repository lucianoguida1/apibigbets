const { Op } = require('sequelize');
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
            const ligas = await ligaServices.pegaTodosOsRegistros({
                where: filters,
                order: [['id', 'asc']],
                limit: parseInt(pageSize, 10),
                offset: parseInt((page - 1) * pageSize),
            });
            if (ligas.length == 0) {
                return res.status(404).json({
                    error: 'Nenhuma liga nessa pagina!',
                    pagina: { pagina: parseInt(page), total_registro: ligas.length },
                });
            }
            return res.status(200).json({
                message: 'Ligas buscadas com sucesso!',
                pagina: { pagina: parseInt(page), total_registro: ligas.length },
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
