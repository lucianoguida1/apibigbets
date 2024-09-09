require('dotenv').config();
const Controller = require('./Controller.js');
const RegravalidacoeServices = require('../services/RegravalidacoeServices.js');
const logTo = require('../utils/logTo.js');
const { Op } = require('sequelize');
const { Odd } = require('../database/models');
const formatMilliseconds = require('../utils/formatMilliseconds.js');

const regraServices = new RegravalidacoeServices();

class ServicesBaseController extends Controller {

    async validaRegras() {
        try {
            const regras = regraServices.pegaTodosOsRegistros({where: {'regra':''}});
        } catch (error) {
            logTo('Erro ao validar os jogos:', error.message);
            console.error('Erro ao validar os jogos:', error.message);
        }
    }
}

module.exports = ServicesBaseController;
