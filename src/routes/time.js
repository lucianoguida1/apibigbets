const { Router } = require('express');
const TimeController = require('../controllers/TimeController.js');

const time = new TimeController();
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Time
 *   description: API para gerenciar os Times
 */

/**
 * @swagger
 * /searchtime:
 *   get:
 *     summary: Retorna uma lista de times
 *     tags: [Time]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca para filtrar os times pelo nome
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página para paginação
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Número máximo de registros a serem retornados por página
 *     responses:
 *       200:
 *         description: Lista de times retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Times buscados com sucesso!
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *                     totalItems:
 *                       type: integer
 *                       example: 30
 *                     totalRegistro:
 *                       type: integer
 *                       example: 30
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       value:
 *                         type: string
 *                         example: "1"
 *                       label:
 *                         type: string
 *                         example: "Nome do Time"
 *       400:
 *         description: Nenhum time encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Não foi encontrado nenhum time
 *                 errorCode:
 *                   type: integer
 *                   example: 400
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 0
 *                     totalItems:
 *                       type: integer
 *                       example: 0
 *                     totalRegistro:
 *                       type: integer
 *                       example: 0
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Erro interno ao buscar times
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Erro interno ao buscar times
 *                 errorCode:
 *                   type: integer
 *                   example: 500
 *                 details:
 *                   type: string
 *                   example: Error message
 */
router.get('/searchtime', (req, res) => time.searchTime(req, res));

module.exports = router;