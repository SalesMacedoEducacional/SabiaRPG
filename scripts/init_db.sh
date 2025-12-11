#!/bin/bash
set -e

PGDATA="./pgdata"
PGPORT="${PGPORT:-5432}"

if [ -d "$PGDATA/base" ]; then
    echo "Cluster PostgreSQL já existe em $PGDATA. Pulando inicialização."
    exit 0
fi

echo "Inicializando cluster PostgreSQL em $PGDATA..."
initdb -D "$PGDATA" -U postgres --auth=trust

cat >> "$PGDATA/postgresql.conf" <<EOF
port = $PGPORT
listen_addresses = 'localhost'
log_destination = 'stderr'
logging_collector = on
log_directory = '..'
log_filename = 'postgres.log'
EOF

pg_ctl -D "$PGDATA" -l ./postgres.log -o "-p $PGPORT" start
sleep 2

createdb -h localhost -p "$PGPORT" -U postgres sabia || true

pg_ctl -D "$PGDATA" stop -m fast

echo "Cluster inicializado com sucesso! DB 'sabia' criado."
echo "Execute 'npm run db:start' para iniciar o PostgreSQL."
