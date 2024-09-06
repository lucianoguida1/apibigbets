require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const cron = require('node-cron');
const JogoServices = require('./services/RequestServices.js');
const ReqPServices = require('./services/RequisicaopendenteServices.js');
const jogoServices = new JogoServices();
const reqPServices = new ReqPServices();

const RequestController = require('./controllers/RequestController.js');

const app = express();
routes(app);

const request = new RequestController();

async function jogoa(a) {
    const jogo = await jogoServices.pegaUmRegistroPorId(42);
    const casa = await jogo.getFora();
    const casaa = await casa.getJogos();
    console.log(await jogo.getOdds())
    return 
};

if (process.env.NODE_ENV != 'production') {
    //const jogo = jogoa();
    request.dadosSport()
}
// Configurando a tarefa cron para executar a cada 5 horas
cron.schedule('0 */5 * * *', async () => {
    await request.dadosSport();
});
cron.schedule('0 */3 * * *', async () => {
    await request.adicionaJogos();
});

app.get('/teste', async (req, res) => {
    res.status(200).send({ mensagem: 'Ok!' })
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
    let jogos = await jogoServices.pegaEContaRegistros();
    let reqP = await reqPServices.pegaEContaRegistros();
    res.status(200).send({ Requisicoes: jogos, ReqPendentes: reqP});
})

module.exports = app;