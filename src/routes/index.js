const express = require('express');
const path = require('path');
const RequestController = require('../controllers/RequestController.js');
const ServicesBaseController = require('../controllers/ServicesBaseController.js');

const regraValidacao = require('./regraValidacao.js');
const odd = require('./odd.js');
const servicesBase = require('./services.js')

const serviceBase = new ServicesBaseController();
const request = new RequestController();

module.exports = app => {
    app.use(
        express.json(),
        regraValidacao,
        odd,
        servicesBase,
    );

    const dbFilePath = path.join(__dirname, '../database/storage/database.db');
    app.get('/downloaddb', (req, res) => {
        res.download(dbFilePath, 'database.db', (err) => {
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
    app.get('/executaregras', async (req, res) => {
        serviceBase.validaRegras();
        res.status(200).send({ mensagem: 'Ok!' });
    });

    app.get('/', async (req, res) => {
        res.status(200).send({ mensagem: 'Ok!' })
    });
};