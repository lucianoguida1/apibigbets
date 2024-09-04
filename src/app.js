require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const cron = require('node-cron');
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
})

module.exports = app;