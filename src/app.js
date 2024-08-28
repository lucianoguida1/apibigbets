const express = require('express');
const routes = require('./routes');
const cron = require('node-cron');

const app = express();
routes(app);


// Configurando a tarefa cron para executar a cada 10 segundos
cron.schedule('*/10 * * * * *', () => {
    console.log('Executando tarefa para atualizar países:', new Date());
});

app.get('/teste', (req, res) => {
    res.status(200).send({mensagem: 'Ok!'})
})

module.exports = app;