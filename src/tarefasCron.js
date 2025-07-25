const cron = require('node-cron');
const Queue = require('./lib/Queue');

const ServicesBaseController = require('./controllers/ServicesBaseController.js');
const serviceBase = new ServicesBaseController();


// Define cada tarefa como uma função separada
const tarefas = {

    async tarefa19hrs() {
        try {
            await Queue.add('getDadosAPI');
            await Queue.add('executaEstrategias');
            await Queue.add('validaOdds');
        } catch (error) {
            console.error('Erro na tarefa agendada às 19hrs:', error.message);
        }
    },

    async tarefa10hrs() {
        try {
            await Queue.add('getDadosAPI', { date: new Date().toISOString().split('T')[0] });
            await Queue.add('executaEstrategias');
            await Queue.add('validaOdds');
            await Queue.add('calculaFiltroJogos');
        } catch (error) {
            console.error('Erro na tarefa agendada às 7hrs:', error.message);
        }
    },

    async tarefa2Horas() {
        try {
            await Queue.add('getJogosAPI');
            await Queue.add('validaOdds');
            await Queue.add('validaBilhetes');
            await Queue.add('atualizaGraficos');
        } catch (error) {
            console.error('Erro na tarefa agendada a cada 3 horas:', error.message);
        }
    },

    async tarefa5Minutos() {
        try {
            await Queue.add('verficaGruposTelegram');
            await Queue.add('enviaMsgTelegram');
        } catch (error) {
            console.error('Erro na tarefa agendada a cada 5 minutos:', error.message);
        }
    },

    async montabilhete() {
        try {
            await Queue.add('executaEstrategias');
        } catch (error) {
            console.error('Erro na tarefa de montar bilhete:', error.message);
        }
    },

    async validaBilhete() {
        try {
            await Queue.add('validaOdds');
            await Queue.add('validaBilhetes');
        } catch (error) {
            console.error('Erro na tarefa de validar bilhete:', error.message);
        }
    },

    async enviaMensagens() {
        try {
            await Queue.add('verficaGruposTelegram');
            await Queue.add('enviaMsgTelegram');
        } catch (error) {
            console.error('Erro na tarefa de enviar mensagens Telegram:', error.message);
        }
    },

    async atualizaGraficos() {
        try {
            await Queue.add('atualizaGraficos');
        } catch (error) {
            console.error('Erro na tarefa de atualizar gráficos:', error.message);
        }
    }
};

// Agendamento automático com `node-cron`
const agendarTarefas = async () => {
    cron.schedule('0 19 * * *', tarefas.tarefa19hrs);
    cron.schedule('0 10 * * *', tarefas.tarefa10hrs);
    cron.schedule('0 */2 * * *', tarefas.tarefa2Horas);
    cron.schedule('*/2 * * * *', tarefas.tarefa5Minutos);
};

module.exports = { agendarTarefas, tarefas };
