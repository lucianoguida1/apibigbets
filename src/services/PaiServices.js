const Services = require('./Services.js');
const { Pai, Liga, Temporada, Jogo, Odd, Time } = require('../database/models');
const { Op } = require('sequelize');
const toDay = require('../utils/toDay.js');
class PaiServices extends Services {
    constructor() {
        super('Pai');
    }

    async paisCompleto(data = toDay(-1)) {
        const pais = await Pai.findAll({
            where: { id: 26 },
            include: {
                model: Liga,
                require: true,
                include: {
                    model: Temporada,
                    require: true,
                    include: {
                        model: Jogo,
                        require: true,
                        //where: { data: data },
                        include: [
                            {
                                model: Odd,
                                require: true,
                                where: { status: { [Op.ne]: null } }
                            }, {
                                model: Time,
                                as: 'casa',
                                require: true
                            }, {
                                model: Time,
                                as: 'fora',
                                require: true
                            }
                        ]
                    }
                }
            }
        })

        return pais;
    }

}

module.exports = PaiServices;