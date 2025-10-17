const express = require('express');
const fs = require('fs');
const path = require('path');
const regraValidacao = require('./regraValidacao.js');
const estrategia = require('./estrategia.js');
const pais = require('./pais.js');
const liga = require('./liga.js');
const time = require('./time.js');
const filtrojogo = require('./filtrojogo.js');
const jogo = require('./jogo.js');
const help = require('./help.js');
const dashboard = require('./dashboard.js');
const bilhete = require('./bilhete.js');

const ServicesBaseController = require('../controllers/ServicesBaseController.js');
const serviceBase = new ServicesBaseController();


module.exports = app => {
    app.use(
        express.json(),
        regraValidacao,
        estrategia,
        pais,
        liga,
        time,
        filtrojogo,
        jogo,
        help,
        dashboard,
        bilhete
    );

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

    /**
    * @swagger
    * /validabilhetes:
    *   get:
    *     summary: Valida os bilhetes
    *     tags: [Services Base]
    *     responses:
    *       200:
    *         description: Bilhetes validados com sucesso
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
    *                   example: Bilhetes validados com sucesso.
    *                 statusCode:
    *                   type: integer
    *                   example: 200
    *                 pagination:
    *                   type: object
    *                   example: {}
    *                 data:
    *                   type: string
    *                   example: Bilhetes validados com sucesso.
    *       500:
    *         description: Erro interno ao validar os bilhetes
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
    *                   example: Erro interno ao validar os bilhetes!
    *                 errorCode:
    *                   type: integer
    *                   example: 500
    *                 details:
    *                   type: string
    *                   example: Error message details
    */
    app.get('/validabilhetes', async (req, res) => {
        try {
            serviceBase.validaBilhetes();
            return res.status(200).json({
                "status": "success",
                "message": "Bilhetes validados com sucesso.",
                "statusCode": 200,
                "pagination": {},
                data: "Bilhetes validados com sucesso."
            });
        } catch (error) {
            return res.status(500).json({
                "status": "error",
                "message": "Erro interno ao validar os bilhetes!",
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
