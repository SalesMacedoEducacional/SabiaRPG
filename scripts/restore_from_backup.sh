#!/bin/bash
set -e

BACKUP_FILE="${1:-./backup/db_cluster-07-07-2025@19-28-51.backup.gz}"
PGDATA="./pgdata"
PGPORT="${PGPORT:-5432}"
TEMP_FILE=""

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Erro: Arquivo de backup não encontrado: $BACKUP_FILE"
    exit 1
fi

echo "Verificando PostgreSQL..."
if ! pg_ctl -D "$PGDATA" status > /dev/null 2>&1; then
    echo "Iniciando PostgreSQL..."
    pg_ctl -D "$PGDATA" -l ./postgres.log -o "-p $PGPORT" start
    sleep 2
fi

createdb -h localhost -p "$PGPORT" -U postgres sabia 2>/dev/null || true

if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Descompactando backup..."
    TEMP_FILE=$(mktemp)
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    RESTORE_FILE="$TEMP_FILE"
else
    RESTORE_FILE="$BACKUP_FILE"
fi

echo "Tentando criar extensões comuns..."
for ext in pgcrypto "uuid-ossp" pg_stat_statements; do
    psql -h localhost -p "$PGPORT" -U postgres -d sabia -c "CREATE EXTENSION IF NOT EXISTS \"$ext\";" 2>/dev/null || true
done

echo "Restaurando backup (paralelo)..."
if ! pg_restore -h localhost -p "$PGPORT" -U postgres -d sabia --clean --no-owner --no-privileges -j 2 "$RESTORE_FILE" 2>/dev/null; then
    echo "Restauração paralela falhou. Tentando sem paralelismo..."
    pg_restore -h localhost -p "$PGPORT" -U postgres -d sabia --clean --no-owner --no-privileges "$RESTORE_FILE" 2>/dev/null || true
fi

if [ -n "$TEMP_FILE" ] && [ -f "$TEMP_FILE" ]; then
    rm -f "$TEMP_FILE"
fi

echo "Restore concluído"
