#!/bin/bash
set -e

PGDATA="./pgdata"
PGPORT="${PGPORT:-5432}"
PGSOCKET="./pgsocket"

mkdir -p "$PGSOCKET"

if [ -d "$PGDATA/base" ]; then
    echo "Cluster PostgreSQL já existe em $PGDATA. Pulando inicialização."
    exit 0
fi

echo "Inicializando cluster PostgreSQL em $PGDATA..."
initdb -D "$PGDATA" -U postgres --auth=trust

cat >> "$PGDATA/postgresql.conf" <<EOF
port = $PGPORT
listen_addresses = 'localhost'
unix_socket_directories = '$PWD/$PGSOCKET'
log_destination = 'stderr'
logging_collector = on
log_directory = '$PWD'
log_filename = 'postgres.log'
EOF

echo "Iniciando PostgreSQL para criar banco..."
pg_ctl -D "$PGDATA" -l ./postgres.log start
sleep 3

createdb -h localhost -p "$PGPORT" -U postgres sabia || true

pg_ctl -D "$PGDATA" stop -m fast

echo "Cluster inicializado com sucesso! DB 'sabia' criado."
echo "Execute 'bash scripts/start_db.sh' para iniciar o PostgreSQL."
