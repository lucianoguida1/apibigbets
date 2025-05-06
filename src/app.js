require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { createBullBoard } = require('bull-board');
const { BullAdapter } = require('bull-board/bullAdapter');
const Queue = require('./lib/Queue');


const routes = require('./routes');
const tarefaCron = require('./tarefasCron');

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
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

const { router: bullBoardRouter } = createBullBoard(
  Queue.queues.map(queue => new BullAdapter(queue.bull))
);

// Corrigir assets quebrados
app.use('/adminwl/queues', (req, res, next) => {
  req.originalUrl = '/api1.0/' + req.url; // caminho fixado
  return bullBoardRouter(req, res, next);
});

routes(app);

// Tarefas agendadas
tarefaCron.agendarTarefas();






 
 (async () => {
   //await Queue.add('enviaMsgTelegram');
 })();
 

module.exports = app;
