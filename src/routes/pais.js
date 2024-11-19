const { Router } = require('express');
const PaisController = require('../controllers/PaisController.js');

const paisController = new PaisController();
const router = Router();


router.get('/paisform', (req, res) => paisController.paisForm(req, res));


module.exports = router;
