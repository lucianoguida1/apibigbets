const cron = require('node-cron');
const RequestController = require('./controllers/RequestController.js');
const ServicesBaseController = require('./controllers/ServicesBaseController.js');

const serviceBase = new ServicesBaseController();
const request = new RequestController();


const tarefas = () => {

    //// VALIDA SE AS ODD ATENDEU AS REGRAS
    // Roda a cada 90 minuto
    let counter = 0;  // Contador para controlar o intervalo de 90 minutos

    cron.schedule('*/30 * * * *', async () => {
        try {
            counter += 30;  // Incrementa o contador a cada 30 minutos
            if (counter >= 90) {
                serviceBase.validaRegras();  // Executa a tarefa
                counter = 0;  // Reinicia o contador
            }
        } catch (error) {
            logTo('Erro na tarefa agendada:', error.message);
        }
    });

    //// EXECUTA O DELETE DE JOGOS SEM DADOS
    //Roda a cada 5 hora
    cron.schedule('0 */5 * * *', async () => {
        try {
            await serviceBase.deletaJogosAntigos();
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
            await request.adicionaJogos();
        } catch (error) {
            logTo('Erro na tarefa agendada:', error.mesage);
        }
    });
}

module.exports = tarefas;