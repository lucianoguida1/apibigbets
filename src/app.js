require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const tarefaCron = require('./tarefasCron.js');
const app = express();
routes(app);

// EXECUTA AS TAREFAS CRONS
tarefaCron();

module.exports = app;