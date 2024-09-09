const Controller = require('./Controller.js');
const OddServices = require('../services/OddServices.js');
const oddServices = new OddServices();

class OddController extends Controller {
    constructor() {
        super(oddServices);
    }
}

module.exports = OddController;
