const { Router } = require('express');
const RequestController = require('../controllers/RequestController.js');

const requestController = new RequestController();
const router = Router();

// Rota para listar todos os requests
router.get('/requests', (req, res) => requestController.pegaTodos(req, res));

// Rota para pegar um request específico pelo ID
router.get('/requests/:id', (req, res) => requestController.pegaUmPorId(req, res));

// Rota para criar um novo request
router.post('/requests', (req, res) => requestController.criaNovo(req, res));

// Rota para atualizar um request pelo ID
router.put('/requests/:id', (req, res) => requestController.atualiza(req, res));

// Rota para deletar um request pelo ID
router.delete('/requests/:id', (req, res) => requestController.exclui(req, res));

module.exports = router;
