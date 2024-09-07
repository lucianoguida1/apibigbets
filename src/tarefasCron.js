const cron = require('node-cron');
const RequestController = require('./controllers/RequestController.js');
const ServicesBaseController = require('./controllers/ServicesBaseController.js');

const serviceBase = new ServicesBaseController();
const request = new RequestController();


const tarefas = () => {

    //// VALIDA SE AS ODD ATENDEU AS REGRAS
    // Roda a cada minuto
    cron.schedule('0 * * * * *', async () => {
        try {
            //serviceBase.validaRegras();
        } catch (error) {
            logTo('Erro na tarefa agendada:', error.mesage);
        }
    });

    //// EXECUTA O CARREGAMENTO DE ODDS
    //Roda a cada 5 hora
    cron.schedule('0 */5 * * *', async () => {
        try {
            await request.dadosSport();
        } catch (error) {
            logTo('Erro na tarefa agendada:', error.mesage);
        }
    });

    /// ATUALIZA AS INFORMAÇÕES DOS JOGOS
    // roda a cada 3 horas
    cron.schedule('0 */3 * * *', async () => {
        try {
            await JogoServices.adicionaJogos();
        } catch (error) {
            logTo('Erro na tarefa agendada:', error.mesage);
        }
    });
}

module.exports = tarefas;