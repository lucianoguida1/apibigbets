const { Op } = require('sequelize');
const Controller = require('./Controller.js');
const PaiServices = require('../services/PaiServices.js');

const paiServices = new PaiServices();

class PaisController extends Controller {
    async paisForm(req, res) {
        try {
            const { search, limit = 30, offset = 0 } = req.query;

            // Construir filtros dinamicamente
            const filters = {};
            if (search) {
                filters.nome = { [Op.iLike]: `%${search}%` }; // Busca nomes que contenham 'search'
            }

            // Buscar registros com filtros aplicados e limites definidos
            const paises = await paiServices.pegaTodosOsRegistros({
                where: filters,
                limit: parseInt(limit, 10), // Limite máximo de registros
                offset: parseInt(offset, 10), // Paginação
            });
            console.log(paises)
            return res.status(200).json({
                message: 'Países buscados com sucesso!',
                data: paises,
            });
        } catch (error) {
            return res.status(500).json({
                error: `Erro ao buscar os países: ${error.message}`,
            });
        }
    }
}

module.exports = PaisController;
