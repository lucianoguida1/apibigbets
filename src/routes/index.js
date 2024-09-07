const express = require('express');
const path = require('path');
const Request = require('../controllers/RequestController.js');

const request = new Request();

module.exports = app => {
    app.use(
        express.json(),
        //consultas,
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
            // A variável "data" foi preenchida
            await request.dadosSport(data);
        } else {
            // A variável "data" não foi preenchida
            await request.dadosSport();  // Executa sem o parâmetro "data"
        }

        res.status(200).send({ mensagem: 'Ok!' });
    });
    app.get('/', async (req, res) => {
        res.status(200).send({ mensagem: 'Ok!' })
    });
};