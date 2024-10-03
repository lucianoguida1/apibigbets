const logTo = require('../utils/logTo.js');
const Services = require('./Services.js');
const { Odd, Regravalidacoe } = require('../database/models');

class RegravalidacoeServices extends Services {
    constructor() {
        super('Regravalidacoe');
    }

    async pegaRegrasSemOdds() {
        return await Regravalidacoe.findAll({
            // Faz um LEFT JOIN para pegar todas as regras, mesmo sem odds
            include: [{
                model: Odd,
                required: false // LEFT JOIN, pega todas as regras mesmo sem odds
            }],
            // Filtra onde a associação com odds é nula (sem odds associadas)
            where: {
                '$Odds.id$': null
            }
        });
    }
    
    async pegaRegra(nome, tipoAposta) {
        try {
            let regra = await super.pegaUmRegistro({ where: { 'nome': nome, 'tipoaposta_id': tipoAposta.id } });
            if (!regra) {
                regra = await super.criaRegistro({ 'nome': nome, 'tipoaposta_id': tipoAposta.id });
            }
            return regra;
        } catch (error) {
            logTo(error.message);
            console.log(error);
        }
    }
}


module.exports = RegravalidacoeServices;