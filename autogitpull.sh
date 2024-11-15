#!/bin/bash

# CONFIGURAÇÃO DO API BIG BETS
cd /root//projetos/apibigbets/ || exit 1

# Caminho para o arquivo de log
LOG_FILE="/root//projetos/log_gitpull.log"

# Função para redefinir o log se tiver mais de 2 dias
reset_log_if_needed() {
  if [ -f "$LOG_FILE" ]; then
    # Verifica se o arquivo tem mais de 2 dias
    if [ $(find "$LOG_FILE" -mtime +2) ]; then
      echo "Arquivo de log tem mais de 2 dias. Redefinindo..."
      > "$LOG_FILE"  # Limpa o conteúdo do log
    fi
  else
    # Cria o arquivo de log se não existir
    touch "$LOG_FILE"
  fi
}

# Redefinir o log se necessário
reset_log_if_needed

# Redirecionar toda a saída para o arquivo de log
exec > >(tee -a "$LOG_FILE") 2>&1

# Verifica o commit local e o commit remoto
LOCAL_COMMIT=$(git rev-parse @)
REMOTE_COMMIT=$(git ls-remote origin -h refs/heads/main | awk '{print $1}')

# Verifica se há diferenças
if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
    echo "$(date): Há novas atualizações no repositório. Executando git pull..."

    # Faz o git pull para baixar as atualizações
    git pull

    # Executa as migrações
    npm run migrate:prod

    # Reinicia a aplicação no PM2
    pm2 restart api-bigbets
    pm2 save

    echo "$(date): Atualizações aplicadas e aplicação reiniciada."
else
    echo "$(date): Sem novas atualizações."
fi


