const { Router } = require('express');
const RegraValidacaoController = require('../controllers/RegraValidacaoController.js');

const regraValidacao = new RegraValidacaoController();
const router = Router();

router.get('/regrasvalidacaoform', (req, res) => regraValidacao.regrasvalidacaoform(req, res));
router.get('/regrasvalidacao', (req, res) => regraValidacao.pegaTodos(req, res));
router.get('/regrasvalidacao/:id', (req, res) => regraValidacao.pegaUmPorId(req, res));
//router.post('/regrasvalidacao', (req, res) => regraValidacao.criaNovo(req, res));
router.put('/regrasvalidacao/:id', (req, res) => regraValidacao.atualiza(req, res));
//router.delete('/regrasvalidacao/:id', (req, res) => regraValidacao.exclui(req, res));

module.exports = router;
