const { Router } = require('express');
const BilheteController = require('../controllers/BilheteController.js');
const bilheteController = new BilheteController();

const router = Router();

router.get('/bilhetes/hoje', async (req, res) => bilheteController.getBilhetesHoje(req, res));


module.exports = router;