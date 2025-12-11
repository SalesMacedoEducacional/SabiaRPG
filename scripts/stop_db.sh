#!/bin/bash
set -e

PGDATA="./pgdata"

if pg_ctl -D "$PGDATA" status > /dev/null 2>&1; then
    echo "Parando PostgreSQL..."
    pg_ctl -D "$PGDATA" stop -m fast
    echo "PostgreSQL parado com sucesso!"
else
    echo "PostgreSQL não está rodando."
fi
