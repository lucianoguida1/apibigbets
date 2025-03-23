require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const routes = require('./routes');
const tarefaCron = require('./tarefasCron.js');

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

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation with Swagger',
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

routes(app);

// EXECUTA AS TAREFAS CRONS
tarefaCron.agendarTarefas();



const ServicesBaseController = require('./controllers/ServicesBaseController.js');
const serviceBase = new ServicesBaseController();

(async () => {
  //await serviceBase.verificaGrupoBot();
  //await serviceBase.enviaMensagensTelegram();
  //await serviceBase.executarEstrategias();
})();



module.exports = app;