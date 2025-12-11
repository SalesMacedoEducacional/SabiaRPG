#!/bin/bash
set -e

PGDATA="./pgdata"
PGPORT="${PGPORT:-5432}"
PGSOCKET="./pgsocket"

mkdir -p "$PGSOCKET"

if [ ! -d "$PGDATA/base" ]; then
    echo "Cluster PostgreSQL não encontrado em $PGDATA. Execute 'bash scripts/init_db.sh' primeiro."
    exit 1
fi

if pg_ctl -D "$PGDATA" status > /dev/null 2>&1; then
    echo "PostgreSQL já está rodando na porta $PGPORT"
else
    echo "Iniciando PostgreSQL na porta $PGPORT..."
    pg_ctl -D "$PGDATA" -l ./postgres.log start
    sleep 2
    echo "PostgreSQL iniciado com sucesso!"
fi

echo "Porta: $PGPORT"
