require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const tarefaCron = require('./tarefasCron.js');
const app = express();
routes(app);


const RegraSev = require('./services/RegravalidacoeServices.js');
const regraserv = new RegraSev();
async function processarRegras() {
    try {
        console.time('Tempo de Execução'); // Inicia a contagem do tempo

        const regras = await regraserv.pegaTodosOsRegistros();

        for (const regra of regras) {
            const odds = await regra.getOdds(); // Pega as odds associadas à regra
            if (odds.length === 0) {
                console.log('regra: ' + regra.id)
                await regra.destroy({ force: true }); // Exclui a regra se não tiver odds associadas
            }
        }

        console.timeEnd('Tempo de Execução'); // Exibe o tempo de execução no console
    } catch (error) {
        console.error("Erro ao buscar ou processar as regras:", error);
    }
    console.log('passou todos')
}

// Chama a função assíncrona
processarRegras();


// EXECUTA AS TAREFAS CRONS
tarefaCron();

module.exports = app;