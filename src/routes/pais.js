const { Router } = require('express');
const PaisController = require('../controllers/PaisController.js');

const paisController = new PaisController();
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Pais
 *   description: API para gerenciar os paises
 */

/**
 * @swagger
 * /pais:
 *   get:
 *     summary: Retorna uma lista de países
 *     tags: [Pais]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Nome do país para buscar
 *       - in: query
 *         name: ids
 *         schema:
 *           type: string
 *         description: IDs dos países separados por vírgula
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
 *         description: Lista de países retornada com sucesso
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
 *         description: Nenhum país encontrado
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
 *       500:
 *         description: Erro interno ao buscar países
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
router.get('/pais', (req, res) => paisController.getPais(req, res));


module.exports = router;
