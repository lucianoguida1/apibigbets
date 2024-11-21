require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const tarefaCron = require('./tarefasCron.js');
const cors = require('cors');
const bodyParser = require('body-parser');

const corsOptions = {
    origin: '*', // Permitir apenas este domínio
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Permitir apenas esses métodos
    allowedHeaders: ['Content-Type', 'Authorization'], // Permitir apenas esses cabeçalhos
    credentials: false // Se você precisar permitir credenciais (cookies, autorização)
};

const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

routes(app);

// EXECUTA AS TAREFAS CRONS
tarefaCron();





const ServicesBaseController = require('./controllers/ServicesBaseController.js');

const executar = async () => {
    const serviceBase = new ServicesBaseController();
    try {
        await serviceBase.geraEstisticaGeral();
    } catch (error) {
        console.error('Erro ao validar regras:', error.message);
    }
};  
executar();;



module.exports = app;