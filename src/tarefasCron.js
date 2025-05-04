const cron = require('node-cron');
const Queue = require('./lib/Queue');

const ServicesBaseController = require('./controllers/ServicesBaseController.js');
const serviceBase = new ServicesBaseController();


// Define cada tarefa como uma função separada
const tarefas = {
    async tarefa20hrs() {
        try {
            await serviceBase.geraEstisticaGeral();
        } catch (error) {
            console.error('Erro na tarefa agendada às 20hrs:', error.message);
        }
    },

    async tarefa19hrs() {
        try {
            await Queue.add('getDadosAPI'); 
            await serviceBase.executarEstrategias();
            await serviceBase.validaRegras();
        } catch (error) {
            console.error('Erro na tarefa agendada às 19hrs:', error.message);
        }
    },

    async tarefa10hrs() {
        try {
            await Queue.add('getDadosAPI'); 
            await serviceBase.executarEstrategias();
            await serviceBase.validaRegras();
        } catch (error) {
            console.error('Erro na tarefa agendada às 7hrs:', error.message);
        }
    },

    async tarefa2Horas() {
        try {
            await Queue.add('getJogosAPI'); // Adiciona a tarefa de obter jogos à fila
            await serviceBase.validaRegras();
            await serviceBase.validaBilhetes();
            await serviceBase.atualizaGraficos();
        } catch (error) {
            console.error('Erro na tarefa agendada a cada 3 horas:', error.message);
        }
    },

    async tarefa5Minutos() {
        try {
            await serviceBase.verificaGrupoBot();
            await serviceBase.enviaMensagensTelegram();
        } catch (error) {
            console.error('Erro na tarefa agendada a cada 5 minutos:', error.message);
        }
    },

    async montabilhete() {
        try {
            await serviceBase.executarEstrategias();
        } catch (error) {
            console.error('Erro na tarefa de montar bilhete:', error.message);
        }
    },

    async validaBilhete() {
        try {
            await serviceBase.validaRegras();
            await serviceBase.validaBilhetes();
        } catch (error) {
            console.error('Erro na tarefa de validar bilhete:', error.message);
        }
    },

    async enviaMensagens() {
        try {
            await serviceBase.verificaGrupoBot();
            await serviceBase.enviaMensagensTelegram();
        } catch (error) {
            console.error('Erro na tarefa de enviar mensagens Telegram:', error.message);
        }
    },

    async atualizaGraficos() {
        try {
            await serviceBase.atualizaGraficos();
        } catch (error) {
            console.error('Erro na tarefa de atualizar gráficos:', error.message);
        }
    }
};

// Agendamento automático com `node-cron`
const agendarTarefas = () => {
    cron.schedule('0 20 * * *', tarefas.tarefa20hrs);
    cron.schedule('0 19 * * *', tarefas.tarefa19hrs);
    cron.schedule('0 10 * * *', tarefas.tarefa10hrs);
    cron.schedule('0 */2 * * *', tarefas.tarefa2Horas);
    cron.schedule('*/2 * * * *', tarefas.tarefa5Minutos);
};

module.exports = { agendarTarefas, tarefas };
