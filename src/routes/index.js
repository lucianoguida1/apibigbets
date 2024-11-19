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

    const dbFilePath = path.join(__dirname, '../database/storage/bigbets.backup');
    app.get('/downloaddb', (req, res) => {
        res.download(dbFilePath, 'bigbets.backup', (err) => {
            if (err) {
                console.error('Erro ao fazer download da base de dados:', err);
                res.status(500).send('Erro ao baixar o banco de dados');
            }
        });
    });

    app.get('/executa/:data?', async (req, res) => {
        const data = req.params.data;

        if (data) {
            await request.dadosSport(data);
        } else {
            await request.dadosSport();
        }
        res.status(200).send({ mensagem: 'Ok!' });
    });

    app.get('/buscajogos/', async (req, res) => {
        const dates = req.body.dates;

        if (!Array.isArray(dates)) {
            return res.status(400).send({ mensagem: 'O campo "dates" deve ser um array.' });
        }

        try {
            for (const date of dates) {
                await request.adicionaJogos(date);
            }
            res.status(200).send({ mensagem: 'Jogos adicionados para todas as datas.' });
        } catch (error) {
            console.error(error);
            res.status(500).send({ mensagem: 'Erro ao adicionar jogos para as datas.', error });
        }
    });

    app.get('/executaregras', async (req, res) => {
        serviceBase.validaRegras();
        res.status(200).send({ mensagem: 'Ok!' });
    });

    app.get('/deletajogosantigo', async (req, res) => {
        serviceBase.deletaJogosAntigos();
        res.status(200).send({ mensagem: 'Ok!' });
    });

    app.get('/executarestrategias', async (req, res) => {
        serviceBase.executarEstrategias();
        res.status(200).send({ mensagem: 'Ok!' });
    });

    app.get('/', async (req, res) => {
        res.status(200).send({ mensagem: 'Ok!' });
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
