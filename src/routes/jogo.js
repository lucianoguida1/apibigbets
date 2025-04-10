const { Router } = require('express');
const JogoController = require('../controllers/JogoController.js');

const jogoController = new JogoController();
const router = Router();


router.get('/jogossemplacar', (req, res) => jogoController.getJogosSemPlacar(req, res));


module.exports = router;
