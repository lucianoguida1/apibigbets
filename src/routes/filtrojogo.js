const { Router } = require('express');
const FiltrojogoController = require('../controllers/FiltrojogoController.js');

const filtrojogoController = new FiltrojogoController();
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Pais
 *   description: API para gerenciar os paises
 */

router.post('/filtrojogo', (req, res) => filtrojogoController.createFiltroJogo(req, res));
router.get('/filtrojogo', (req, res) => filtrojogoController.getFiltrosJogos(req, res));


module.exports = router;
