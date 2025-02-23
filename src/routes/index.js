const express = require('express');
const fs = require('fs');
const path = require('path');

const RequestController = require('../controllers/RequestController.js');
const ServicesBaseController = require('../controllers/ServicesBaseController.js');

const regraValidacao = require('./regraValidacao.js');
const odd = require('./odd.js');
const servicesBase = require('./services.js');
const requestRouter = require('./request.js');
const estrategia = require('./estrategia.js');
const regra = require('./regra.js');
const pais = require('./pais.js');
const liga = require('./liga.js');

const serviceBase = new ServicesBaseController();
const request = new RequestController();

module.exports = app => {
    app.use(
        express.json(),
        regraValidacao,
        odd,
        servicesBase,
        requestRouter,
        estrategia,
        regra,
        pais,
        liga,
    );

    /**
     * @swagger
     * tags:
     *   name: Services Base
     *   description: API para gerenciar serviços base
     */

    /**
    * @swagger
    * /dadosSport/{data}:
    *   get:
    *     summary: Lista todos os Estratégia
    *     tags: [Services Base]
    *     parameters:
    *       - in: path
    *         name: data
    *         required: false
    *         schema:
    *           type: string
    *         description: Data para buscar os dados
    *     responses:
    *       200:
    *         description: Busca por dados do Sport iniciada com sucesso
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
    *                   example: Busca por dados do Sport iniciada com sucesso!
    *                 statusCode:
    *                   type: integer
    *                   example: 200
    *                 pagination:
    *                   type: object
    *                   example: {}
    *                 data:
    *                   type: string
    *                   example: ok
    *       500:
    *         description: Erro interno ao iniciar a busca por dados do Sport
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
    *                   example: Erro interno ao iniciar a busca por dados do Sport!
    *                 errorCode:
    *                   type: integer
    *                   example: 500
    *                 details:
    *                   type: string
    *                   example: Error message details
    */
    app.get('/dadosSport/:data?', async (req, res) => {
        const data = req.params.data;
        try {
            if (data) {
                await request.dadosSport(data);
            } else {
                await request.dadosSport();
            }
            return res.status(200).json({
                "status": "success",
                "message": "Busca por dados do Sport iniciada com sucesso!",
                "statusCode": 200,
                "pagination": {},
                data: "ok"
            });
        } catch (error) {
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao iniciar a busca por dados do Sport!",
                "errorCode": 500,
                "details": error.message
            });
        }
    });


    /**
    * @swagger
    * /buscajogos/:
    *   get:
    *     summary: Adiciona jogos para as datas fornecidas
    *     tags: [Services Base]
    *     requestBody:
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             type: object
    *             properties:
    *               dates:
    *                 type: array
    *                 items:
    *                   type: string
    *                 example: ["2023-10-01", "2023-10-02"]
    *     responses:
    *       200:
    *         description: Jogos adicionados para todas as datas
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
    *                   example: Jogos adicionados para todas as datas.
    *                 statusCode:
    *                   type: integer
    *                   example: 200
    *                 pagination:
    *                   type: object
    *                   example: {}
    *                 data:
    *                   type: string
    *                   example: Jogos adicionados para todas as datas.
    *       400:
    *         description: Erro de validação
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
    *                   example: O campo as "datas" deve ser um array.
    *                 errorCode:
    *                   type: integer
    *                   example: 400
    *                 details:
    *                   type: string
    *                   example: O campo as "datas" deve ser um array.
    *       500:
    *         description: Erro interno ao iniciar a busca por jogos na API Sport
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
    *                   example: Erro interno ao iniciar a busca por jogos na API Sport!
    *                 errorCode:
    *                   type: integer
    *                   example: 500
    *                 details:
    *                   type: string
    *                   example: Error message details
    */
    app.get('/buscajogos/', async (req, res) => {
        const datas = req.body.dates;

        if (!Array.isArray(dates)) {
            return res.status(400).json({
                "status": "error",
                "message": 'O campo as "datas" deve ser um array.',
                "errorCode": 400,
                "details": 'O campo as "datas" deve ser um array.'
            });
        } else {
            for (const date of dates) {
                if (isNaN(Date.parse(date))) {
                    return res.status(400).json({
                        "status": "error",
                        "message": `A data "${date}" não é válida.`,
                        "errorCode": 400,
                        "details": `Indentificamos que o valor: "${date}" não é válida.`
                    });
                }
            }
        }

        try {
            for (const date of dates) {
                await request.adicionaJogos(date);
            }
            return res.status(200).json({
                "status": "success",
                "message": "Jogos adicionados para todas as datas.",
                "statusCode": 200,
                "pagination": {},
                data: "Jogos adicionados para todas as datas."
            });
        } catch (error) {
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao iniciar a busca por jogos na API Sport!",
                "errorCode": 500,
                "details": error.message
            });
        }
    });

    /**
    * @swagger
    * /executaregras:
    *   get:
    *     summary: Executa as regras para validação das odds
    *     tags: [Services Base]
    *     responses:
    *       200:
    *         description: As regras para validação das odds estão sendo executadas
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
    *                   example: As regras para validação das odds estão sendo executadas.
    *                 statusCode:
    *                   type: integer
    *                   example: 200
    *                 pagination:
    *                   type: object
    *                   example: {}
    *                 data:
    *                   type: string
    *                   example: As regras para validação das odds estão sendo executadas.
    *       500:
    *         description: Erro interno ao executar as regras para validação das odds
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
    *                   example: Erro interno ao executar as regras para validação das odds!
    *                 errorCode:
    *                   type: integer
    *                   example: 500
    *                 details:
    *                   type: string
    *                   example: Error message details
    */
    app.get('/executaregras', async (req, res) => {
        try {
            serviceBase.validaRegras();
            return res.status(200).json({
                "status": "success",
                "message": "As regras para validação das odds estão sendo executadas.",
                "statusCode": 200,
                "pagination": {},
                data: "As regras para validação das odds estão sendo executadas."
            });
        } catch (error) {
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao iniciar a busca por jogos na API Sport!",
                "errorCode": 500,
                "details": error.message
            });
        }
    });


    /**
    * @swagger
    * /deletajogosantigo:
    *   get:
    *     summary: Deleta jogos antigos
    *     tags: [Services Base]
    *     responses:
    *       200:
    *         description: Jogos antigos deletados com sucesso
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
    *                   example: Jogos antigos deletados com sucesso.
    *                 statusCode:
    *                   type: integer
    *                   example: 200
    *                 pagination:
    *                   type: object
    *                   example: {}
    *                 data:
    *                   type: string
    *                   example: Jogos antigos deletados com sucesso.
    *       500:
    *         description: Erro interno ao deletar jogos antigos
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
    *                   example: Erro interno ao deletar jogos antigos!
    *                 errorCode:
    *                   type: integer
    *                   example: 500
    *                 details:
    *                   type: string
    *                   example: Error message details
    */
    app.get('/deletajogosantigo', async (req, res) => {
        try {
            serviceBase.deletaJogosAntigos();
            return res.status(200).json({
                "status": "success",
                "message": "Jogos antigos deletados com sucesso.",
                "statusCode": 200,
                "pagination": {},
                data: "Jogos antigos deletados com sucesso."
            });
        } catch (error) {
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao deletar jogos antigos!",
                "errorCode": 500,
                "details": error.message
            });
        }
    });

    /**
    * @swagger
    * /executarestrategias:
    *   get:
    *     summary: Executa as estratégias
    *     tags: [Services Base]
    *     responses:
    *       200:
    *         description: Estratégias executadas com sucesso
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
    *                   example: Estratégias executadas com sucesso.
    *                 statusCode:
    *                   type: integer
    *                   example: 200
    *                 pagination:
    *                   type: object
    *                   example: {}
    *                 data:
    *                   type: string
    *                   example: Estratégias executadas com sucesso.
    *       500:
    *         description: Erro interno ao executar as estratégias
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
    *                   example: Erro interno ao executar as estratégias!
    *                 errorCode:
    *                   type: integer
    *                   example: 500
    *                 details:
    *                   type: string
    *                   example: Error message details
    */
    app.get('/executarestrategias', async (req, res) => {
        try {
            serviceBase.executarEstrategias();
            return res.status(200).json({
                "status": "success",
                "message": "Estratégias executadas com sucesso.",
                "statusCode": 200,
                "pagination": {},
                data: "Estratégias executadas com sucesso."
            });
        } catch (error) {
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao executar as estratégias!",
                "errorCode": 500,
                "details": error.message
            });
        }
    });

    app.get('/', async (req, res) => {
        return res.status(200).json({
            "status": "success",
            "message": "A API está rodando perfeitamente!.",
            "statusCode": 200,
            "pagination": {},
            data: "A API está rodando perfeitamente!."
        });
    });

    // Nova rota para buscar arquivos JSON de odds com pagina
    app.get('/api/json/odds/', (req, res) => {
        const page = req.query.page;
        const jsonFilePath = path.join(__dirname, `../database/storage/jsons/odds_${page}.json`);

        // Verificar se o arquivo existe
        if (fs.existsSync(jsonFilePath)) {
            // Ler o conteúdo do arquivo e enviar como resposta
            fs.readFile(jsonFilePath, 'utf-8', (err, data) => {
                if (err) {
                    console.error('Erro ao ler o arquivo:', err);
                    res.status(500).send('Erro ao ler o arquivo JSON');
                } else {
                    res.status(200).json(JSON.parse(data));
                }
            });
        } else {
            res.status(404).send({ mensagem: 'Arquivo JSON não encontrado' });
        }
    });

    // Nova rota para buscar arquivos JSON de fixtures sem pagina
    app.get('/api/json/fixtures', (req, res) => {
        const jsonFilePath = path.join(__dirname, '../database/storage/jsons/fixtures_0.json');

        // Verificar se o arquivo existe
        if (fs.existsSync(jsonFilePath)) {
            // Ler o conteúdo do arquivo e enviar como resposta
            fs.readFile(jsonFilePath, 'utf-8', (err, data) => {
                if (err) {
                    console.error('Erro ao ler o arquivo:', err);
                    res.status(500).send('Erro ao ler o arquivo JSON');
                } else {
                    res.status(200).json(JSON.parse(data));
                }
            });
        } else {
            res.status(404).send({ mensagem: 'Arquivo JSON não encontrado' });
        }
    });
};
