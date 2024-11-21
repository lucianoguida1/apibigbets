const cron = require('node-cron');
const RequestController = require('./controllers/RequestController.js');
const ServicesBaseController = require('./controllers/ServicesBaseController.js');
const toDay = require('./utils/toDay.js');

const serviceBase = new ServicesBaseController();
const request = new RequestController();


const tarefas = () => {
    
    // Executa as 20hrs
    cron.schedule('0 20 * * *', async () => {
        try {
            await serviceBase.geraEstisticaGeral();
        } catch (error) {
            logTo('Erro na tarefa agendada as 20hrs:', error.mesage);
        }
    });

    // Executa as 19hrs
    cron.schedule('0 19 * * *', async () => {
        try {
            await request.dadosSport();
            await serviceBase.deletaJogosAntigos();
            await serviceBase.executarEstrategias();
        } catch (error) {
            logTo('Erro na tarefa agendada as 19hrs:', error.mesage);
        }
    });

    // Executa as 7hrs
    cron.schedule('0 7 * * *', async () => {
        try {
            await request.dadosSport(date = toDay());
            await request.adicionaJogos(date = toDay(-1));
            await serviceBase.executarEstrategias();
        } catch (error) {
            logTo('Erro na tarefa agendada as 19hrs:', error.mesage);
        }
    });
    
    // roda a cada 3 horas
    cron.schedule('0 */3 * * *', async () => {
        try {
            await request.adicionaJogos(date = toDay());
            await serviceBase.validaRegras();
            await serviceBase.validaBilhetes();
        } catch (error) {
            logTo('Erro na tarefa agendada:', error.mesage);
        }
    });
}

module.exports = tarefas;