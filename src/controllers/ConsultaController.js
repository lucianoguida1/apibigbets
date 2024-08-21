const Controller = require('./Controller.js');
const ConsultaServices = require('../services/ConsultaServices.js');

const consultaServices = new ConsultaServices();

class ConsultaController extends Controller{
    constructor(){
        super(consultaServices);
    }

}

module.exports = ConsultaController;