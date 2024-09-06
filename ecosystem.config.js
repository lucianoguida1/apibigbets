module.exports = {
    apps: [
        {
            name: 'apidash',
            script: 'server.js',
            watch: true, // Ativa o monitoramento de alterações
            ignore_watch: [
                "src/database/storage/",
                ".env",
                "logs/",
                "dist/"
            ],
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};