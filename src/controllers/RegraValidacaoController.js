const Controller = require('./Controller.js');
const RegravalidacoeServices = require('../services/RegravalidacoeServices.js');
const regrasServices = new RegravalidacoeServices();

class RegraValidacaoController extends Controller {
    constructor() {
        super(regrasServices);
    }
}

module.exports = RegraValidacaoController;