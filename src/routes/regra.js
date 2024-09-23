const { Router } = require('express');
const RegraController = require('../controllers/RegraController.js');

const regraController = new RegraController();
const router = Router();

router.get('/regraestrategia', (req, res) => regraController.pegaTodos(req, res));
router.get('/regraestrategia/:id', (req, res) => regraController.pegaUmPorId(req, res));
router.post('/regraestrategia', (req, res) => regraController.criaNovo(req, res));
router.put('/regraestrategia/:id', (req, res) => regraController.atualiza(req, res));
router.delete('/regraestrategia/:id', (req, res) => regraController.exclui(req, res));

module.exports = router;
