const Services = require('./Services.js');

class RequisicaopendenteServices extends Services {
    constructor() {
        super('requisicaopendente');
    }

    async pegaPendente(modulo, data = new Date()) {
        const startOfDay = new Date(data);
        startOfDay.setHours(0, 0, 0, 0);  // Início do dia
        const startOfNextDay = new Date(startOfDay);
        startOfNextDay.setDate(startOfNextDay.getDate() + 1);  // Início do próximo dia
        let reqPen = await super.pegaUmRegistro({
            where: {
                'modulo': modulo,
                createdAt: {
                    [Op.gte]: startOfDay,
                    [Op.lt]: startOfNextDay
                }
            }
        });
        if (!reqPen) {
            reqPen = await super.criaRegistro({ 'modulo': modulo, 'pagina': 1 });
        }
        return reqPen;
    }
}

module.exports = RequisicaopendenteServices;