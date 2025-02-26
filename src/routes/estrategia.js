const { Router } = require('express');
const EstrategiaController = require('../controllers/EstrategiaController.js');

const estrategiaController = new EstrategiaController();
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Estrategia
 *   description: API para gerenciar Estratégia
 */

/**
 * @swagger
 * /estrategia:
 *   get:
 *     summary: Lista todos os Estratégia
 *     tags: [Estrategia]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número da página
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Número de itens por página
 *     responses:
 *       200:
 *         description: Lista de Estratégia retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: integer
 *                     example: 200
 *                   message:
 *                     type: string
 *                     example: "Operação realizada com sucesso"
 *                   pagination:
 *                     type: object
 *                     properties:
 *                       page:
 *                         type: integer
 *                         example: 1
 *                       totalPages:
 *                         type: integer
 *                         example: 3
 *                       totalItems:
 *                         type: integer
 *                         example: 10
 *                   data:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 66
 *                         nome:
 *                           type: string
 *                           example: "GGGGGGGGGGGGGGGGGGGG"
 *                         descricao:
 *                           type: string
 *                           example: ""
 *                         taxaacerto:
 *                           type: number
 *                           format: float
 *                           example: 42.99
 *                         totalacerto:
 *                           type: integer
 *                           example: 181
 *                         totalerro:
 *                           type: integer
 *                           example: 240
 *                         odd_media:
 *                           type: number
 *                           format: float
 *                           example: 2.86
 *                         odd_minima:
 *                           type: number
 *                           format: float
 *                           example: 2.3
 *                         odd_maxima:
 *                           type: number
 *                           format: float
 *                           example: 3
 *                         media_odd_vitoriosa:
 *                           type: number
 *                           format: float
 *                           example: 2.86
 *                         media_odd_derrotada:
 *                           type: number
 *                           format: float
 *                           example: 2.85
 *                         total_apostas:
 *                           type: integer
 *                           example: 421
 *                         frequencia_apostas_dia:
 *                           type: number
 *                           format: float
 *                           example: 3.57
 *                         sequencia_vitorias:
 *                           type: integer
 *                           example: 181
 *                         sequencia_derrotas:
 *                           type: integer
 *                           example: 240
 *                         total_vitorias:
 *                           type: integer
 *                           example: 181
 *                         total_derrotas:
 *                           type: integer
 *                           example: 240
 *                         lucro_total:
 *                           type: number
 *                           format: float
 *                           example: 97.01
 *                         qtde_usuarios:
 *                           type: integer
 *                           example: 0
 *                         media_sequencia_vitorias:
 *                           type: integer
 *                           example: 181
 *                         maior_derrotas_dia:
 *                           type: integer
 *                           example: 7
 *                         maior_derrotas_semana:
 *                           type: integer
 *                           example: 42
 *                         maior_vitorias_dia:
 *                           type: integer
 *                           example: 5
 *                         maior_vitorias_semana:
 *                           type: integer
 *                           example: 28
 *                         chat_id:
 *                           type: string
 *                           example: null
 *                         link_grupo:
 *                           type: string
 *                           example: null
 *                         chave_grupo:
 *                           type: string
 *                           example: "1ltx"
 *                         Regras:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 117
 *                               pai_id:
 *                                 type: integer
 *                                 example: null
 *                               liga_id:
 *                                 type: integer
 *                                 example: null
 *                               temporada_id:
 *                                 type: integer
 *                                 example: null
 *                               regravalidacoe2_id:
 *                                 type: integer
 *                                 example: 1
 *                               oddmin2:
 *                                 type: number
 *                                 format: float
 *                                 example: 3
 *                               oddmax2:
 *                                 type: number
 *                                 format: float
 *                                 example: 8
 *                               regravalidacoe3_id:
 *                                 type: integer
 *                                 example: null
 *                               oddmin3:
 *                                 type: number
 *                                 format: float
 *                                 example: null
 *                               oddmax3:
 *                                 type: number
 *                                 format: float
 *                                 example: null
 *                               oddmin:
 *                                 type: number
 *                                 format: float
 *                                 example: 2.3
 *                               oddmax:
 *                                 type: number
 *                                 format: float
 *                                 example: 3
 *                               multipla:
 *                                 type: integer
 *                                 example: 1
 *       404:
 *         description: Estratégias não encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Estrategias não encontradas"
 *                 errorCode:
 *                   type: integer
 *                   example: 404
 *                 details:
 *                   type: string
 *                   example: "Nenhuma estrategia foi encontrada!"
 *       500:
 *         description: Erro interno ao buscar estratégias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Erro interno ao buscar estrategias"
 *                 errorCode:
 *                   type: integer
 *                   example: 500
 *                 details:
 *                   type: string
 *                   example: "Detalhes do erro"
 */
router.get('/estrategia', (req, res) => estrategiaController.getEstrategias(req, res));

/**
 * @swagger
 * /estrategia/{id}:
 *   get:
 *     summary: Pega uma Estratégia
 *     tags: [Estrategia]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da Estratégia
 *     responses:
 *       200:
 *         description: Estratégia retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Operação realizada com sucesso"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 66
 *                     nome:
 *                       type: string
 *                       example: "GGGGGGGGGGGGGGGGGGGG"
 *                     descricao:
 *                       type: string
 *                       example: ""
 *                     taxaacerto:
 *                       type: number
 *                       format: float
 *                       example: 42.99
 *                     totalacerto:
 *                       type: integer
 *                       example: 181
 *                     totalerro:
 *                       type: integer
 *                       example: 240
 *                     odd_media:
 *                       type: number
 *                       format: float
 *                       example: 2.86
 *                     odd_minima:
 *                       type: number
 *                       format: float
 *                       example: 2.3
 *                     odd_maxima:
 *                       type: number
 *                       format: float
 *                       example: 3
 *                     media_odd_vitoriosa:
 *                       type: number
 *                       format: float
 *                       example: 2.86
 *                     media_odd_derrotada:
 *                       type: number
 *                       format: float
 *                       example: 2.85
 *                     total_apostas:
 *                       type: integer
 *                       example: 421
 *                     frequencia_apostas_dia:
 *                       type: number
 *                       format: float
 *                       example: 3.57
 *                     sequencia_vitorias:
 *                       type: integer
 *                       example: 181
 *                     sequencia_derrotas:
 *                       type: integer
 *                       example: 240
 *                     total_vitorias:
 *                       type: integer
 *                       example: 181
 *                     total_derrotas:
 *                       type: integer
 *                       example: 240
 *                     lucro_total:
 *                       type: number
 *                       format: float
 *                       example: 97.01
 *                     qtde_usuarios:
 *                       type: integer
 *                       example: 0
 *                     media_sequencia_vitorias:
 *                       type: integer
 *                       example: 181
 *                     maior_derrotas_dia:
 *                       type: integer
 *                       example: 7
 *                     maior_derrotas_semana:
 *                       type: integer
 *                       example: 42
 *                     maior_vitorias_dia:
 *                       type: integer
 *                       example: 5
 *                     maior_vitorias_semana:
 *                       type: integer
 *                       example: 28
 *                     chat_id:
 *                       type: string
 *                       example: null
 *                     link_grupo:
 *                       type: string
 *                       example: null
 *                     chave_grupo:
 *                       type: string
 *                       example: "1ltx"
 *                     Regras:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 117
 *                           pai_id:
 *                             type: integer
 *                             example: null
 *                           liga_id:
 *                             type: integer
 *                             example: null
 *                           temporada_id:
 *                             type: integer
 *                             example: null
 *                           regravalidacoe2_id:
 *                             type: integer
 *                             example: 1
 *                           oddmin2:
 *                             type: number
 *                             format: float
 *                             example: 3
 *                           oddmax2:
 *                             type: number
 *                             format: float
 *                             example: 8
 *                           regravalidacoe3_id:
 *                             type: integer
 *                             example: null
 *                           oddmin3:
 *                             type: number
 *                             format: float
 *                             example: null
 *                           oddmax3:
 *                             type: number
 *                             format: float
 *                             example: null
 *                           oddmin:
 *                             type: number
 *                             format: float
 *                             example: 2.3
 *                           oddmax:
 *                             type: number
 *                             format: float
 *                             example: 3
 *                           multipla:
 *                             type: integer
 *                             example: 1
  *       404:
 *         description: Estratégias não encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Estrategias não encontradas"
 *                 errorCode:
 *                   type: integer
 *                   example: 404
 *                 details:
 *                   type: string
 *                   example: "Nenhuma estrategia foi encontrada!"
 *       500:
 *         description: Erro interno ao buscar estratégias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Erro interno ao buscar estrategia"
 *                 errorCode:
 *                   type: integer
 *                   example: 500
 *                 details:
 *                   type: string
 *                   example: "Detalhes do erro"
 */
router.get('/estrategia/:id', (req, res) => estrategiaController.getEstrategia(req, res));

/**
 * @swagger
 * /estrategia/grafico/{id}:
 *   get:
 *     summary: Pega o gráfico de uma Estratégia
 *     tags: [Estrategia]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da Estratégia
 *     responses:
 *       200:
 *         description: Gráfico da Estratégia retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Operação realizada com sucesso"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                 statusCode:
 *                  type: integer
 *                  example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     saldo_dia_dia:
 *                       type: array
 *                       items:
 *                         type: number
 *                         format: float
 *                     labels:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "2024/09"
 *                     saldosFixos:
 *                       type: array
 *                       items:
 *                         type: number
 *                         format: float
 *                         example: "-0.10"
 *                     saldoFixoAcumulado:
 *                       type: array
 *                       items:
 *                         type: number
 *                         format: float
 *                         example: "-0.10"
 *       404:
 *         description: Gráfico não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Gráfico não encontrado"
 *                 errorCode:
 *                   type: integer
 *                   example: 404
 *                 details:
 *                   type: string
 *                   example: "Nenhum gráfico foi encontrado para a estratégia fornecida!"
 *       500:
 *         description: Erro interno ao buscar gráfico
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Erro interno ao buscar gráfico"
 *                 errorCode:
 *                   type: integer
 *                   example: 500
 *                 details:
 *                   type: string
 *                   example: "Detalhes do erro"
 */
router.get('/estrategia/grafico/:id', (req, res) => estrategiaController.getEstrategiaGrafico(req, res));

/**
 * @swagger
 * /estrategia/bilhetes/{id}:
 *   get:
 *     summary: Pega os bilhetes de uma Estratégia
 *     tags: [Estrategia]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da Estratégia
 *     responses:
 *       200:
 *         description: Bilhetes da Estratégia retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Estrategias encontradas"
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
 *                       example: 7
 *                     totalItems:
 *                       type: integer
 *                       example: 100
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 546326
 *                       estrategia_id:
 *                         type: integer
 *                         example: 69
 *                       alert:
 *                         type: string
 *                         example: null
 *                       odd:
 *                         type: number
 *                         format: float
 *                         example: 3
 *                       status_bilhete:
 *                         type: boolean
 *                         example: false
 *                       data:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-16T00:00:00.000Z"
 *                       Estrategium:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 69
 *                           nome:
 *                             type: string
 *                             example: "TTT"
 *                           descricao:
 *                             type: string
 *                             example: ""
 *                           taxaacerto:
 *                             type: number
 *                             format: float
 *                             example: 42.99
 *                           totalacerto:
 *                             type: integer
 *                             example: 181
 *                           totalerro:
 *                             type: integer
 *                             example: 240
 *                           odd_media:
 *                             type: number
 *                             format: float
 *                             example: 2.86
 *                           odd_minima:
 *                             type: number
 *                             format: float
 *                             example: 2.3
 *                           odd_maxima:
 *                             type: number
 *                             format: float
 *                             example: 3
 *                           media_odd_vitoriosa:
 *                             type: number
 *                             format: float
 *                             example: 2.86
 *                           media_odd_derrotada:
 *                             type: number
 *                             format: float
 *                             example: 2.85
 *                           total_apostas:
 *                             type: integer
 *                             example: 421
 *                           frequencia_apostas_dia:
 *                             type: number
 *                             format: float
 *                             example: 3.57
 *                           sequencia_vitorias:
 *                             type: integer
 *                             example: 181
 *                           sequencia_derrotas:
 *                             type: integer
 *                             example: 240
 *                           total_vitorias:
 *                             type: integer
 *                             example: 181
 *                           total_derrotas:
 *                             type: integer
 *                             example: 240
 *                           lucro_total:
 *                             type: number
 *                             format: float
 *                             example: 97.01
 *                           qtde_usuarios:
 *                             type: integer
 *                             example: 0
 *                           media_sequencia_vitorias:
 *                             type: integer
 *                             example: 181
 *                           maior_derrotas_dia:
 *                             type: integer
 *                             example: 7
 *                           maior_derrotas_semana:
 *                             type: integer
 *                             example: 42
 *                           maior_vitorias_dia:
 *                             type: integer
 *                             example: 5
 *                           maior_vitorias_semana:
 *                             type: integer
 *                             example: 28
 *                           grafico_json:
 *                             type: string
 *                             example: null
 *                           chat_id:
 *                             type: string
 *                             example: null
 *                           link_grupo:
 *                             type: string
 *                             example: null
 *                           chave_grupo:
 *                             type: string
 *                             example: "8kgb"
 *                           deletedAt:
 *                             type: string
 *                             example: null
 *                       Odds:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 8949918
 *                             odd:
 *                               type: number
 *                               format: float
 *                               example: 3
 *                             status:
 *                               type: boolean
 *                               example: false
 *                             nome:
 *                               type: string
 *                               example: "Draw"
 *                             Jogo:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 68546
 *                                 datahora:
 *                                   type: string
 *                                   format: date-time
 *                                   example: "2025-02-16T12:00:00.000Z"
 *                                 gols_casa:
 *                                   type: integer
 *                                   example: 0
 *                                 gols_fora:
 *                                   type: integer
 *                                   example: 3
 *                                 casa:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: integer
 *                                       example: 11980
 *                                     nome:
 *                                       type: string
 *                                       example: "Feronikeli"
 *                                     logo:
 *                                       type: string
 *                                       example: "https://media.api-sports.io/football/teams/4132.png"
 *                                 fora:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: integer
 *                                       example: 739
 *                                     nome:
 *                                       type: string
 *                                       example: "Llapi"
 *                                     logo:
 *                                       type: string
 *                                       example: "https://media.api-sports.io/football/teams/14395.png"
 *                             bilhetesodds:
 *                               type: object
 *                               properties:
 *                                 createdAt:
 *                                   type: string
 *                                   format: date-time
 *                                   example: "2025-02-23T01:52:58.851Z"
 *                                 updatedAt:
 *                                   type: string
 *                                   format: date-time
 *                                   example: "2025-02-23T01:52:58.851Z"
 *                                 bilhete_id:
 *                                   type: integer
 *                                   example: 546326
 *                                 odd_id:
 *                                   type: integer
 *                                   example: 8949918
 *       404:
 *         description: Erro ao encontrar bilhetes ou estratégia não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Erro ao encontrar bilhetes ou estratégia não encontrada"
 *                 errorCode:
 *                   type: integer
 *                   example: 404
 *                 details:
 *                   type: string
 *                   example: "Nenhum bilhete foi encontrado para a estratégia fornecida!"
 *       500:
 *         description: Erro interno ao buscar bilhetes ou estratégia"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Erro interno ao buscar bilhetes ou estratégia"
 *                 errorCode:
 *                   type: integer
 *                   example: 500
 *                 details:
 *                   type: string
 *                   example: "Detalhes do erro"
 */
router.get('/estrategia/bilhetes/:id', (req, res) => estrategiaController.getBilhetes(req, res));

/**
 * @swagger
 * /estrategia:
 *   post:
 *     summary: Cria uma nova Estratégia
 *     tags: [Estrategia]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "TTT"
 *               descricao:
 *                 type: string
 *                 example: ""
 *               regras:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     pais:
 *                       type: string
 *                       example: ""
 *                     liga:
 *                       type: string
 *                       example: ""
 *                     time:
 *                       type: string
 *                       example: ""
 *                     aposta:
 *                       type: string
 *                       example: "2"
 *                     oddMin:
 *                       type: number
 *                       format: float
 *                       example: 3
 *                     oddMax:
 *                       type: number
 *                       format: float
 *                       example: 6
 *                     aposta2:
 *                       type: string
 *                       example: "1"
 *                     oddMin2:
 *                       type: number
 *                       format: float
 *                       example: 3
 *                     oddMax2:
 *                       type: number
 *                       format: float
 *                       example: 8
 *                     aposta3:
 *                       type: string
 *                       example: ""
 *                     oddMin3:
 *                       type: number
 *                       format: float
 *                       example: null
 *                     oddMax3:
 *                       type: number
 *                       format: float
 *                       example: null
 *     responses:
 *       201:
 *         description: Estratégia criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Estratégia criada com sucesso!"
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 pagination:
 *                   type: object
 *                   properties: {}
 *                 data:
 *                   type: object
 *                   properties:
 *                     chave_grupo:
 *                       type: string
 *                       example: "58gl"
 *                     id:
 *                       type: integer
 *                       example: 70
 *                     nome:
 *                       type: string
 *                       example: "TTT"
 *                     descricao:
 *                       type: string
 *                       example: ""
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-23T04:54:41.764Z"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-23T04:54:30.664Z"
 *                     taxaacerto:
 *                       type: number
 *                       format: float
 *                       example: 38.88
 *                     totalacerto:
 *                       type: integer
 *                       example: 979
 *                     totalerro:
 *                       type: integer
 *                       example: 1539
 *                     odd_media:
 *                       type: number
 *                       format: float
 *                       example: 3.77
 *                     odd_minima:
 *                       type: number
 *                       format: float
 *                       example: 3
 *                     odd_maxima:
 *                       type: number
 *                       format: float
 *                       example: 6
 *                     media_odd_vitoriosa:
 *                       type: number
 *                       format: float
 *                       example: 3.70
 *                     media_odd_derrotada:
 *                       type: number
 *                       format: float
 *                       example: 3.81
 *                     total_apostas:
 *                       type: integer
 *                       example: 2518
 *                     frequencia_apostas_dia:
 *                       type: number
 *                       format: float
 *                       example: 18.38
 *                     sequencia_vitorias:
 *                       type: integer
 *                       example: 979
 *                     sequencia_derrotas:
 *                       type: integer
 *                       example: 1539
 *                     total_vitorias:
 *                       type: integer
 *                       example: 979
 *                     total_derrotas:
 *                       type: integer
 *                       example: 1539
 *                     lucro_total:
 *                       type: number
 *                       format: float
 *                       example: 1103.18
 *                     qtde_usuarios:
 *                       type: integer
 *                       example: 0
 *                     media_sequencia_vitorias:
 *                       type: number
 *                       format: float
 *                       example: 979.00
 *                     maior_derrotas_dia:
 *                       type: integer
 *                       example: 21
 *                     maior_derrotas_semana:
 *                       type: integer
 *                       example: 243
 *                     maior_vitorias_dia:
 *                       type: integer
 *                       example: 17
 *                     maior_vitorias_semana:
 *                       type: integer
 *                       example: 159
 *                     grafico_json:
 *                       type: string
 *                       example: null
 *                     chat_id:
 *                       type: string
 *                       example: null
 *                     link_grupo:
 *                       type: string
 *                       example: null
 *                     deletedAt:
 *                       type: string
 *                       example: null
 *       500:
 *         description: Erro interno ao criar estratégia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Erro interno ao criar estratégia"
 *                 errorCode:
 *                   type: integer
 *                   example: 500
 *                 details:
 *                   type: string
 *                   example: "Detalhes do erro"
 */
router.post('/estrategia', (req, res) => estrategiaController.criarEstrategia(req, res));

/**
 * @swagger
 * /estrategia/teste:
 *   post:
 *     summary: Testa uma nova Estratégia
 *     tags: [Estrategia]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "GGGGGGGGGGGGGGGGGGGG"
 *               descricao:
 *                 type: string
 *                 example: ""
 *               regras:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     pais:
 *                       type: string
 *                       example: ""
 *                     liga:
 *                       type: string
 *                       example: ""
 *                     time:
 *                       type: string
 *                       example: ""
 *                     aposta:
 *                       type: string
 *                       example: "2"
 *                     oddMin:
 *                       type: number
 *                       format: float
 *                       example: 2.3
 *                     oddMax:
 *                       type: number
 *                       format: float
 *                       example: 3
 *                     aposta2:
 *                       type: string
 *                       example: "1"
 *                     oddMin2:
 *                       type: number
 *                       format: float
 *                       example: 3
 *                     oddMax2:
 *                       type: number
 *                       format: float
 *                       example: 8
 *                     aposta3:
 *                       type: string
 *                       example: ""
 *                     oddMin3:
 *                       type: number
 *                       format: float
 *                       example: null
 *                     oddMax3:
 *                       type: number
 *                       format: float
 *                       example: null
 *     responses:
 *       200:
 *         description: Teste realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Teste realizado com sucesso!"
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 pagination:
 *                   type: object
 *                   properties: {}
 *                 data:
 *                   type: object
 *                   properties:
 *                     nome:
 *                       type: string
 *                       example: "GGGGGGGGGGGGGGGGGGGG"
 *                     descricao:
 *                       type: string
 *                       example: ""
 *                     regras:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           oddmin:
 *                             type: number
 *                             format: float
 *                             example: 2.3
 *                           oddmax:
 *                             type: number
 *                             format: float
 *                             example: 3
 *                           pai_id:
 *                             type: integer
 *                             example: null
 *                           liga_id:
 *                             type: integer
 *                             example: null
 *                           regravalidacoe_id:
 *                             type: string
 *                             example: "2"
 *                           regravalidacoe2_id:
 *                             type: string
 *                             example: "1"
 *                           oddmin2:
 *                             type: number
 *                             format: float
 *                             example: 3
 *                           oddmax2:
 *                             type: number
 *                             format: float
 *                             example: 8
 *                           regravalidacoe3_id:
 *                             type: integer
 *                             example: null
 *                           oddmin3:
 *                             type: number
 *                             format: float
 *                             example: null
 *                           oddmax3:
 *                             type: number
 *                             format: float
 *                             example: null
 *                           id:
 *                             type: string
 *                             example: "11740287512557"
 *                     total_apostas:
 *                       type: integer
 *                       example: 603
 *                     totalacerto:
 *                       type: integer
 *                       example: 258
 *                     totalerro:
 *                       type: integer
 *                       example: 345
 *                     odd_total:
 *                       type: number
 *                       format: float
 *                       example: 1738.55
 *                     odd_minima:
 *                       type: number
 *                       format: float
 *                       example: 2.3
 *                     odd_maxima:
 *                       type: number
 *                       format: float
 *                       example: 3
 *                     total_vitorias:
 *                       type: integer
 *                       example: 258
 *                     total_derrotas:
 *                       type: integer
 *                       example: 345
 *                     lucro_total:
 *                       type: number
 *                       format: float
 *                       example: "141.83"
 *                     media_odd_vitoriosa:
 *                       type: number
 *                       format: float
 *                       example: "2.89"
 *                     media_odd_derrotada:
 *                       type: number
 *                       format: float
 *                       example: "2.88"
 *                     media_sequencia_vitorias:
 *                       type: number
 *                       format: float
 *                       example: "1.80"
 *                     maior_derrotas_dia:
 *                       type: integer
 *                       example: 19
 *                     maior_derrotas_semana:
 *                       type: integer
 *                       example: 70
 *                     maior_vitorias_dia:
 *                       type: integer
 *                       example: 10
 *                     maior_vitorias_semana:
 *                       type: integer
 *                       example: 45
 *                     sequencia_vitorias:
 *                       type: integer
 *                       example: null
 *                     sequencia_derrotas:
 *                       type: integer
 *                       example: null
 *                     taxaacerto:
 *                       type: number
 *                       format: float
 *                       example: "42.79"
 *                     odd_media:
 *                       type: number
 *                       format: float
 *                       example: "2.88"
 *                     frequencia_apostas_dia:
 *                       type: number
 *                       format: float
 *                       example: "5.11"
 *                     grafico:
 *                       type: object
 *                       properties:
 *                         saldo_dia_dia:
 *                           type: array
 *                           items:
 *                             type: number
 *                             format: float
 *                         labels:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: "2024/09"
 *                         saldosFixos:
 *                           type: array
 *                           items:
 *                             type: number
 *                             format: float
 *                             example: "-0.10"
 *                         saldoFixoAcumulado:
 *                           type: array
 *                           items:
 *                             type: number
 *                             format: float
 *                             example: "-0.10"
 *       500:
 *         description: Erro interno ao testar estratégia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Erro interno ao testar estratégia"
 *                 errorCode:
 *                   type: integer
 *                   example: 500
 *                 details:
 *                   type: string
 *                   example: "Detalhes do erro"
 */
router.post('/estrategia/teste/', (req, res) => estrategiaController.estrategiaTeste(req, res));

/**
 * @swagger
 * /topestrategia:
 *   get:
 *     summary: Pega a estratégia top
 *     tags: [Estrategia]
 *     responses:
 *       200:
 *         description: Estratégia encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Estrategia encontrada"
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 pagination:
 *                   type: object
 *                   properties: {}
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 66
 *                     nome:
 *                       type: string
 *                       example: "GGGGGGGGGGGGGGGGGGGG"
 *                     descricao:
 *                       type: string
 *                       example: ""
 *                     taxaacerto:
 *                       type: number
 *                       format: float
 *                       example: 42.99
 *                     totalacerto:
 *                       type: integer
 *                       example: 181
 *                     totalerro:
 *                       type: integer
 *                       example: 240
 *                     odd_media:
 *                       type: number
 *                       format: float
 *                       example: 2.86
 *                     odd_minima:
 *                       type: number
 *                       format: float
 *                       example: 2.3
 *                     odd_maxima:
 *                       type: number
 *                       format: float
 *                       example: 3
 *                     media_odd_vitoriosa:
 *                       type: number
 *                       format: float
 *                       example: 2.86
 *                     media_odd_derrotada:
 *                       type: number
 *                       format: float
 *                       example: 2.85
 *                     total_apostas:
 *                       type: integer
 *                       example: 421
 *                     frequencia_apostas_dia:
 *                       type: number
 *                       format: float
 *                       example: 3.57
 *                     sequencia_vitorias:
 *                       type: integer
 *                       example: 181
 *                     sequencia_derrotas:
 *                       type: integer
 *                       example: 240
 *                     total_vitorias:
 *                       type: integer
 *                       example: 181
 *                     total_derrotas:
 *                       type: integer
 *                       example: 240
 *                     lucro_total:
 *                       type: number
 *                       format: float
 *                       example: 97.01
 *                     qtde_usuarios:
 *                       type: integer
 *                       example: 0
 *                     media_sequencia_vitorias:
 *                       type: number
 *                       format: float
 *                       example: 181
 *                     maior_derrotas_dia:
 *                       type: integer
 *                       example: 7
 *                     maior_derrotas_semana:
 *                       type: integer
 *                       example: 42
 *                     maior_vitorias_dia:
 *                       type: integer
 *                       example: 5
 *                     maior_vitorias_semana:
 *                       type: integer
 *                       example: 28
 *                     chat_id:
 *                       type: string
 *                       example: null
 *                     link_grupo:
 *                       type: string
 *                       example: null
 *                     chave_grupo:
 *                       type: string
 *                       example: "1ltx"
 *                     Regras:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 117
 *                           regravalidacoe2_id:
 *                             type: integer
 *                             example: 1
 *                           oddmin2:
 *                             type: number
 *                             format: float
 *                             example: 3
 *                           oddmax2:
 *                             type: number
 *                             format: float
 *                             example: 8
 *                           regravalidacoe3_id:
 *                             type: integer
 *                             example: null
 *                           oddmin3:
 *                             type: number
 *                             format: float
 *                             example: null
 *                           oddmax3:
 *                             type: number
 *                             format: float
 *                             example: null
 *                           oddmin:
 *                             type: number
 *                             format: float
 *                             example: 2.3
 *                           oddmax:
 *                             type: number
 *                             format: float
 *                             example: 3
 *                           multipla:
 *                             type: integer
 *                             example: 1
 *       404:
 *         description: Estratégia não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Estratégia não encontrada"
 *                 errorCode:
 *                   type: integer
 *                   example: 404
 *                 details:
 *                   type: string
 *                   example: "Nenhuma estratégia foi encontrada!"
 *       500:
 *         description: Erro interno ao buscar estratégia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Erro interno ao buscar estratégia"
 *                 errorCode:
 *                   type: integer
 *                   example: 500
 *                 details:
 *                   type: string
 *                   example: "Detalhes do erro"
 */
router.get('/topestrategia', (req, res) => estrategiaController.getTopEstrategia(req, res));

module.exports = router;
