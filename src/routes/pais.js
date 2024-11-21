const { Router } = require('express');
const PaisController = require('../controllers/PaisController.js');

const paisController = new PaisController();
const router = Router();


router.get('/paisform', (req, res) => paisController.getPais(req, res));
router.get('/pais', (req, res) => paisController.getPais(req, res));


module.exports = router;
