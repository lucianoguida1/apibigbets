const { Router } = require('express');
const HelpController = require('../controllers/HelpController.js');

const helpController = new HelpController();
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Help
 *   description: API para gerenciar os Helps
 */

router.post('/help', (req, res) => helpController.createHelp(req, res));


module.exports = router;
