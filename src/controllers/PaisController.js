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
            const ligas = await paiServices.pegaTodosOsRegistros({
                where: {...filters, dados_json: { [Op.ne]: null }},
                order: [[Sequelize.literal("(dados_json->>'num_jogos')::int"), 'DESC']],
                limit: parseInt(pageSize, 10),
                offset: parseInt((page - 1) * pageSize),
            });
            if (ligas.length == 0) {
                return res.status(404).json({
                    error: 'Nenhum Pais nessa pagina!',
                    pagina: { pagina: parseInt(page), total_registro: ligas.length },
                });
            }
            return res.status(200).json({
                message: 'Pais buscadas com sucesso!',
                pagina: { pagina: parseInt(page), total_registro: ligas.length },
                data: ligas,
            });
        } catch (error) {
            return res.status(500).json({
                error: `Erro ao buscar os paise: ${error.message}`,
            });
        }
    }
}

module.exports = PaisController;
