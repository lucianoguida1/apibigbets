require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const tarefaCron = require('./tarefasCron.js');
const app = express();
routes(app);


const pLimit = require('p-limit');
const limit = pLimit(5000); // Limita a 100 exclusões simultâneas

async function processarRegras() {
    try {
        console.time('Tempo de Execução'); // Inicia a contagem do tempo

        const regras = await regraserv.pegaTodosOsRegistros();

        // Limita o número de promessas simultâneas
        const promessas = regras.map((regra) =>
            limit(async () => {
                const odds = await regra.getOdds();
                if (odds.length === 0) {
                    console.log('regra: ' + regra.id);
                    await regra.destroy({ force: true }); // Exclui a regra permanentemente
                }
            })
        );

        // Espera todas as promessas serem resolvidas
        await Promise.all(promessas);

        console.timeEnd('Tempo de Execução'); // Exibe o tempo de execução no console
    } catch (error) {
        console.error("Erro ao buscar ou processar as regras:", error);
    }
    console.log('passou todos');
}

processarRegras();



// EXECUTA AS TAREFAS CRONS
tarefaCron();

module.exports = app;