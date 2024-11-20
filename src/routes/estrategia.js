const { Router } = require('express');
const EstrategiaController = require('../controllers/EstrategiaController.js');

const estrategiaController = new EstrategiaController();
const router = Router();

router.get('/estrategia', (req, res) => estrategiaController.getEstrategias(req, res));
router.get('/estrategiaform', (req, res) => estrategiaController.getCamposFormulario(req, res));
router.get('/estrategia/:id', (req, res) => estrategiaController.getEstrategia(req, res));
router.get('/estrategia/grafico/:id', (req, res) => estrategiaController.getEstrategiaGrafico(req, res));
router.get('/estrategia/bilhetes/:id', (req, res) => estrategiaController.getBilhetes(req, res));
router.get('/estrategia/executa/:id', (req, res) => estrategiaController.executarEstrategia(req, res));
router.post('/estrategia', (req, res) => estrategiaController.criarEstrategia(req, res));
router.post('/estrategia/teste/', (req, res) => estrategiaController.estrategiaTeste(req, res));
//router.put('/estrategia/:id', (req, res) => estrategiaController.atualizarEstrategia(req, res));
router.delete('/estrategia/:id', (req, res) => estrategiaController.exclui(req, res));
router.get('/topestrategia', (req, res) => estrategiaController.getTopEstrategia(req, res));

module.exports = router;
