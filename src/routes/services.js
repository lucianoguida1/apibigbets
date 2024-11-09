const { Router } = require('express');
const ServicesController = require('../controllers/ServicesBaseController');

const serviceBase = new ServicesController();
const router = Router();

router.get('/services/status', (req, res) => serviceBase.statusBasico(req, res));
router.get('/deletaJogosAntigos', (req, res) => serviceBase.deletaJogosAntigos());
//router.post('/regrasvalidacao', (req, res) => serviceBase.criaNovo(req, res));
//router.put('/regrasvalidacao/:id', (req, res) => serviceBase.atualiza(req, res));
//router.delete('/regrasvalidacao/:id', (req, res) => serviceBase.exclui(req, res));

module.exports = router;
