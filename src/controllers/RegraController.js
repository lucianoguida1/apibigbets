const Controller = require('./Controller.js');
const RegraServices = require('../services/RegraServices.js');
const regraServices = new RegraServices();

class RegraController extends Controller {
    constructor() {
        super(regraServices);
    }
}

module.exports = RegraController;
