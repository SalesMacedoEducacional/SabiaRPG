# Instruções para Configuração do Banco de Dados Supabase

Este documento descreve como configurar as tabelas necessárias no Supabase para o projeto SABIÁ RPG.

## Requisitos

- Conta no Supabase
- Acesso a um projeto no Supabase
- Chaves de API do Supabase configuradas no ambiente (SUPABASE_URL e SUPABASE_KEY)

## Como criar as tabelas

1. Acesse o painel administrativo do seu projeto Supabase (dashboard.supabase.com)
2. Navegue até a seção "SQL Editor" no menu lateral
3. Crie uma nova consulta ("New Query")
4. Copie todo o conteúdo do arquivo `scripts/create-tables.sql` 
5. Cole no editor SQL do Supabase
6. Execute a consulta (botão "Run" ou Ctrl+Enter)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE escolas (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome          text        NOT NULL,
  codigo_escola text        UNIQUE NOT NULL,
  criado_em     timestamp   DEFAULT now()
);

CREATE TABLE usuarios (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         text        UNIQUE NOT NULL,
  senha_hash    text        NOT NULL,
  papel         text        NOT NULL CHECK (papel IN ('aluno','professor','gestor')),
  criado_em     timestamp   DEFAULT now()
);

-- ... e outras tabelas conforme o arquivo create-tables.sql
```

## Verificação da Instalação

Após criar as tabelas, você pode verificar a instalação executando:

```
./scripts/run-setup-db.sh
```

Este script tentará verificar se as tabelas foram criadas corretamente no Supabase.

## Solução de Problemas

- Se você receber erros "relação não existe", as tabelas não foram criadas corretamente
- Certifique-se de que o SQL foi executado com sucesso no painel do Supabase
- Verifique se suas chaves de API estão configuradas corretamente
- Verifique as permissões das tabelas no painel "Authentication > Policies" do Supabase

## Notas Importantes

- Este projeto utiliza o Supabase como banco de dados principal
- As tabelas são estruturadas conforme o modelo de RPG educacional do SABIÁ
- Todas as tabelas usam UUID como chave primária
- Relacionamentos são mantidos através de chaves estrangeiras
- Política de segurança: você deve configurar Row-Level Security (RLS) no Supabase conforme necessário