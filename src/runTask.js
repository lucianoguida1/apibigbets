const { tarefas } = require('./tarefasCron');

// Lê o nome da tarefa do terminal
const tarefa = process.argv[2];

(async () => {
    if (tarefas[tarefa]) {
        console.log(`Executando tarefa: ${tarefa}`);
        await tarefas[tarefa]();
    } else {
        console.error(`Tarefa "${tarefa}" não encontrada.`);
        console.log('Tarefas disponíveis:', Object.keys(tarefas).join(', '));
    }
})();
