const cron = require('node-cron');
const RequestController = require('./controllers/RequestController.js');
const ServicesBaseController = require('./controllers/ServicesBaseController.js');
const toDay = require('./utils/toDay.js');

const serviceBase = new ServicesBaseController();
const request = new RequestController();


const tarefas = () => {

    //// VALIDA SE AS ODD ATENDEU AS REGRAS
    // Roda a cada 90 minuto
    let counter = 0;
    cron.schedule('*/30 * * * *', async () => {
        try {
            counter += 30;
            if (counter >= 90) {
                serviceBase.validaRegras();
                counter = 0;
            }
        } catch (error) {
            logTo('Erro na tarefa agendada:', error.message);
        }
    });

    //// EXECUTA O DELETE DE JOGOS SEM DADOS
    //Roda a cada 5 hora
    cron.schedule('0 */5 * * *', async () => {
        try {
            await serviceBase.executarEstrategias();
        } catch (error) {
            logTo('Erro na tarefa agendada:', error.mesage);
        }
    });

    //// EXECUTA O DELETE DE JOGOS SEM DADOS
    //Roda a cada 12 hora
    cron.schedule('0 */12 * * *', async () => {
        try {
            await serviceBase.deletaJogosAntigos();
        } catch (error) {
            logTo('Erro na tarefa agendada:', error.mesage);
        }
    });

    //// EXECUTA O CARREGAMENTO DE ODDS
    //Roda a cada 8 hora
    cron.schedule('0 */8 * * *', async () => {
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
            await request.adicionaJogos(date = toDay());
        } catch (error) {
            logTo('Erro na tarefa agendada:', error.mesage);
        }
    });
}

module.exports = tarefas;