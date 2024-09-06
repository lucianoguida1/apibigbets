module.exports = {
    apps: [
        {
            name: 'api-bigbets',
            script: 'server.js',
            instances: 1, // Executar apenas uma instância
            exec_mode: 'fork', // Usar modo fork para uma única instância
            //watch: true, // Ativa o monitoramento de alterações
            ignore_watch: [
                "src/database/storage/",
                ".env",
                "logs/",
                "dist/"
            ],
            max_memory_restart: '500M', // Reiniciar se usar mais de 300MB de memória
            autorestart: true, // Reiniciar automaticamente em caso de falha
            max_restarts: 5, // Limite de reinicializações consecutivas
            restart_delay: 5000, // Aguardar 5 segundos antes de reiniciar
            env: {
                NODE_ENV: 'production',
            },
            env_development: {
                NODE_ENV: 'development',
            }
        },
    ],
};
