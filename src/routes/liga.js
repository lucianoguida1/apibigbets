const { Router } = require('express');
const LigasController = require('../controllers/LigasController.js');

const ligasController = new LigasController();
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Ligas
 *   description: API para gerenciar ligas
 */

/**
 * @swagger
 * /ligas:
 *   get:
 *     summary: Retorna uma lista de ligas
 *     tags: [Ligas]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Nome da liga para busca
 *       - in: query
 *         name: paisesId
 *         schema:
 *           type: string
 *         description: IDs dos países separados por vírgula
 *       - in: query
 *         name: ids
 *         schema:
 *           type: string
 *         description: IDs das ligas separados por vírgula
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Tamanho da página
 *     responses:
 *       200:
 *         description: Lista de ligas buscadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     totalRegistro:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Nenhuma liga encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     totalRegistro:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *       500:
 *         description: Erro interno ao buscar ligas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 errorCode:
 *                   type: integer
 *                 details:
 *                   type: string
 */
router.get('/ligas', (req, res) => ligasController.getLigas(req, res));

module.exports = router;
