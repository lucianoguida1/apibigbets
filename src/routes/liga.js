const { Router } = require('express');
const LigasController = require('../controllers/LigasController.js');

const ligasController = new LigasController();
const router = Router();


router.get('/ligasform', (req, res) => ligasController.ligasForm(req, res));


module.exports = router;
