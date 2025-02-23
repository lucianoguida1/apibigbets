const { Router } = require('express');
const RegraValidacaoController = require('../controllers/RegraValidacaoController.js');

const regraValidacao = new RegraValidacaoController();
const router = Router();


/**
 * @swagger
 * tags:
 *   name: Regra de Validação
 *   description: API para gerenciar os Regras de Validação
 */

/**
 * @swagger
 * /regrasvalidacaoform:
 *   get:
 *     summary: Retorna uma lista de regras de validação
 *     tags: [Regra de Validação]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca para filtrar as regras de validação pelo nome
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Número máximo de registros a serem retornados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de registros a serem pulados antes de começar a coletar os resultados
 *     responses:
 *       200:
 *         description: Lista de regras de validação retornada com sucesso
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
 *                   example: Regras buscadas com sucesso!
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
 *                       example: 1
 *                     totalRegistro:
 *                       type: integer
 *                       example: 1
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       nome:
 *                         type: string
 *                         example: TipoAposta - NomeRegra
 *       400:
 *         description: Nenhuma regra de validação encontrada
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
 *                   example: Não foi encontrada nenhuma regra de validação
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
 *         description: Erro interno ao buscar regras de validação
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
 *                   example: Erro interno ao buscar regras de validação
 *                 errorCode:
 *                   type: integer
 *                   example: 500
 *                 details:
 *                   type: string
 *                   example: Error message
 */
router.get('/regrasvalidacaoform', (req, res) => regraValidacao.regrasvalidacaoform(req, res));
module.exports = router;
