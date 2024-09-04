require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const cron = require('node-cron');
const JogoServices = require('./services/JogoServices.js');
const jogoServices = new JogoServices();

const RequestController = require('./controllers/RequestController.js');

const app = express();
routes(app);

const request = new RequestController();

if (process.env.NODE_ENV != 'production') {
    request.dadosSport()
}
// Configurando a tarefa cron para executar a cada 5 horas
cron.schedule('0 */5 * * *', async () => {
    await request.dadosSport();
});
cron.schedule('0 */3 * * *', async () => {
    await request.adicionaJogos();
});

app.get('/teste', async (req, res) => {
    res.status(200).send({ mensagem: 'Ok!' })
})

app.get('/executa', async (req, res) => {
    await request.dadosSport();
});

app.get('/', async (req, res) => {
    let jogos = await jogoServices.pegaEContaRegistros();
    res.status(200).send({totalJogos: jogos});
})

module.exports = app;