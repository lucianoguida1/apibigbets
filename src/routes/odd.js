const { Router } = require('express');
const OddController = require('../controllers/OddController.js');

const oddController = new OddController();
const router = Router();

router.get('/odds', (req, res) => oddController.pegaTodos(req, res));
router.get('/odds/:id', (req, res) => oddController.pegaUmPorId(req, res));
router.post('/odds', (req, res) => oddController.criaNovo(req, res));
router.put('/odds/:id', (req, res) => oddController.atualiza(req, res));
router.delete('/odds/:id', (req, res) => oddController.exclui(req, res));

module.exports = router;
