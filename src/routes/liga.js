const { Router } = require('express');
const LigasController = require('../controllers/LigasController.js');

const ligasController = new LigasController();
const router = Router();


router.get('/ligasform', (req, res) => ligasController.getLigas(req, res));
router.get('/ligas', (req, res) => ligasController.getLigas(req, res));


module.exports = router;
