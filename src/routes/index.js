const express = require('express');

const RequestController = require('../controllers/RequestController.js');
const ServicesBaseController = require('../controllers/ServicesBaseController.js');

const regraValidacao = require('./regraValidacao.js');
const odd = require('./odd.js');
const servicesBase = require('./services.js')
const requestRouter = require('./request.js')
const estrategia = require('./estrategia.js')
const regra = require('./regra.js')

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
    );

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