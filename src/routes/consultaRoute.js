const { Router } = require('express');
const ConsultaController = require('../controllers/ConsultaController.js');

const consultaController = new ConsultaController();

const router = Router();

router.get('/consultas', (req, res) => consultaController.pegaTodos(req, res));
// router.get('/consultas/:id', (req, res) => consultaController.pegaUmPorId(req, res));
// router.post('/consultas', (req, res) => consultaController.criaNovo(req, res));
router.put('/consultas/:id', (req, res) => consultaController.atualiza(req, res));
// router.delete('/consultas/:id', (req, res) => consultaController.exclui(req, res));
module.exports = router;