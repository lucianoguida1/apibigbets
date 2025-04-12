const logTo = require('../utils/logTo.js');
const Services = require('./Services.js');
const { Odd, Regravalidacoe, Tipoaposta } = require('../database/models');
const { Op } = require('sequelize');

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

    async getRegrasValidacao() {
        return await Regravalidacoe.findAndCountAll({
            where: {
                regra: { [Op.ne]: null }
            },
            attributes: { exclude: ["updatedAt", "createdAt", "deletedAt", "regra", "tipoaposta_id"] },
            include: {
                model: Tipoaposta,
                required: true,
                attributes: ['nome','name']
            },
            order: [
                [{ model: Tipoaposta }, 'nome', 'ASC'],
                ['name', 'ASC']
            ]
        });
    }

    async pegaRegra(nome, tipoAposta) {
        try {
            let regra = await super.pegaUmRegistro({ where: { 'name': nome, 'tipoaposta_id': tipoAposta.id } });
            if (!regra) {
                regra = await super.criaRegistro({ 'name': nome, 'tipoaposta_id': tipoAposta.id });
            }
            return regra;
        } catch (error) {
            logTo(error.message);
        }
    }
}


module.exports = RegravalidacoeServices;