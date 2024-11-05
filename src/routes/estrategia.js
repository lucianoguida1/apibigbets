const { Router } = require('express');
const EstrategiaController = require('../controllers/EstrategiaController.js');

const estrategiaController = new EstrategiaController();
const router = Router();

router.get('/estrategia', (req, res) => estrategiaController.pegaTodos(req, res));
router.get('/estrategia/:id', (req, res) => estrategiaController.pegaUmPorId(req, res));
router.get('/estrategia/executa/:id', (req, res) => estrategiaController.executarEstrategia(req, res));
router.post('/estrategia', (req, res) => estrategiaController.criaNovo(req, res));
router.put('/estrategia/:id', (req, res) => estrategiaController.atualiza(req, res));
router.delete('/estrategia/:id', (req, res) => estrategiaController.exclui(req, res));
router.get('/topestrategia', (req, res) => estrategiaController.getTopEstrategia(req, res));

module.exports = router;
