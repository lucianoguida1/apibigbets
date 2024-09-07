require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const tarefaCron = require('./tarefasCron.js');
const app = express();
routes(app);


//request.dadosSport();

// EXECUTA AS TAREFAS CRONS
tarefaCron();

app.get('/teste', async (req, res) => {
    res.status(200).send({ mensagem: 'Ok!' })
});

module.exports = app;