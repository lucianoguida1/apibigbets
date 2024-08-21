const express = require('express');
const consultas = require('./consultaRoute.js');

module.exports = app => {
    app.use(
        express.json(),
        consultas,
    );
};