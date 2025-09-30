module.exports = {
    apps: [
        {
            name: 'api-bigbets',
            script: 'server.js',
            instances: 1,
            exec_mode: 'fork',
            watch: false,
            node_args: '--trace-deprecation --max-old-space-size=2048',
            ignore_watch: [
                'src/database/storage/',
                '.env',
                'logs/',
                'dist/',
                'node_modules/',
                '*.log',
                '.git',
            ],
            max_memory_restart: '3072M',
            autorestart: true,
            max_restarts: 5,
            restart_delay: 5000,
            env: {
                NODE_ENV: 'production',
            }
        },
        {
            name: 'worker-filas',
            script: 'src/queue.js',
            instances: 1,
            exec_mode: 'fork',
            watch: false,
            node_args: '--trace-deprecation --max-old-space-size=2048',
            ignore_watch: [
                'src/database/storage/',
                '.env',
                'logs/',
                'dist/',
                'node_modules/',
                '*.log',
                '.git',
            ],
            max_memory_restart: '6144M',
            autorestart: true,
            max_restarts: 5,
            restart_delay: 5000,
            env: {
                NODE_ENV: 'production',
            }
        }
    ]
};
