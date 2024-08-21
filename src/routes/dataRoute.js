const { Router } = require('express');
const DataController = require('../controllers/DataController.js');

const router = Router();

router.get('/:chave',DataController.dados);

module.exports = router;