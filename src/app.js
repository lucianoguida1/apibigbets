require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const tarefaCron = require('./tarefasCron.js');
const app = express();
routes(app);


const ServicesBaseController = require('./controllers/ServicesBaseController.js')
const servi = new ServicesBaseController()

servi.validaRegras();


const { Op } = require('sequelize');
const { Jogo, Odd, Time, Liga, Temporada, Pai } = require('./database/models');

async function filtrarJogosPorRegra(regra) {
    const whereJogo = {};
    const include = [
        {
            model: Time,
            as: 'casa',
            where: {},
        },
        {
            model: Time,
            as: 'fora',
            where: {},
        }
    ];

    // Filtro por Pais (pai_id) - Acessando através de Liga > Temporada > Jogo
    if (regra.pai_id) {
        include.push({
            model: Temporada,
            required: true, // Esta associação é obrigatória
            include: [
                {
                    model: Liga,
                    required: true, // Liga obrigatória
                    include: [
                        {
                            model: Pai,
                            required: true, // Pais obrigatório
                            where: { id: regra.pai_id } // Filtro por pais através da Liga
                        }
                    ]
                }
            ]
        });
    }

    // Filtro por Liga (liga_id) - Acessando via Temporada
    if (regra.liga_id) {
        include.push({
            model: Temporada,
            required: true, // Temporada obrigatória
            include: [
                {
                    model: Liga,
                    required: true, // Liga obrigatória
                    where: { id: regra.liga_id } // Filtro por Liga
                }
            ]
        });
    }

    // Filtro por Temporada (temporada_id)
    if (regra.temporada_id) {
        include.push({
            model: Temporada,
            required: true, // Temporada obrigatória
            where: { id: regra.temporada_id } // Filtro por Temporada
        });
    }

    // Filtro por Time (time_id)
    if (regra.time_id) {
        whereJogo[Op.or] = [
            { casa_id: regra.time_id },
            { fora_id: regra.time_id }
        ];
    }

    // Buscar jogos com base nos filtros da regra
    const jogos = await Jogo.findAll({
        where: whereJogo,
        include
    });

    return jogos.length;
}



const regra = {
    pai_id: 1,           // Filtro pelo país (através da liga)
    //liga_id: 90,          // Filtro pela liga
    //temporada_id: 3,     // Filtro pela temporada
    time_id: 5,          // Filtro pelo time
    //odd_id: 10           // A odd relacionada sempre é mantida
};

filtrarJogosPorRegra(regra).then(jogos => {
    console.log(jogos);
});





// EXECUTA AS TAREFAS CRONS
tarefaCron();

module.exports = app;