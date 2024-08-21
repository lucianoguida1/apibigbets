const express = require('express');
const routes = require('./routes');

const app = express();
routes(app);

app.get('/teste', (req, res) => {
    res.status(200).send({mensagem: 'Ok!'})
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${PORT}`);
});


module.exports = app;