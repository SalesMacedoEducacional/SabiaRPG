CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE escolas (
  id                 uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome               text        NOT NULL,
  codigo_escola      text        UNIQUE NOT NULL,
  tipo               text        NOT NULL,
  modalidade_ensino  text        NOT NULL,
  cidade             text        NOT NULL,
  estado             text        NOT NULL,
  zona_geografica    text        NOT NULL,
  endereco_completo  text        NOT NULL,
  telefone           text        NOT NULL,
  email_institucional text       NULL,
  gestor_id          text        NULL,
  criado_em          timestamp   DEFAULT now()
);

CREATE TABLE usuarios (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         text        UNIQUE NOT NULL,
  senha_hash    text        NOT NULL,
  papel         text        NOT NULL CHECK (papel IN ('aluno','professor','gestor','admin')),
  nome_completo text        NULL,
  username      text        NULL UNIQUE,
  avatar_url    text        NULL,
  escola_id     uuid        NULL REFERENCES escolas(id),
  ultimo_login  timestamp,
  ativo         boolean     DEFAULT true,
  criado_em     timestamp   DEFAULT now()
);

CREATE TABLE matriculas (
  id               uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
  escola_id        uuid      REFERENCES escolas(id) ON DELETE CASCADE,
  numero_matricula text      UNIQUE NOT NULL,
  nome_aluno       text      NOT NULL,
  turma            text,
  criado_em        timestamp DEFAULT now()
);

CREATE TABLE perfis_aluno (
  id             uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id     uuid      REFERENCES usuarios(id) ON DELETE CASCADE,
  matricula_id   uuid      REFERENCES matriculas(id) ON DELETE RESTRICT,
  avatar_image   text,
  nivel          integer   DEFAULT 1,
  xp             integer   DEFAULT 0,
  criado_em      timestamp DEFAULT now()
);

CREATE TABLE trilhas (
  id         uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo     text      NOT NULL,
  disciplina text      NOT NULL,
  nivel      integer   NOT NULL
);

CREATE TABLE missoes (
  id            uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
  trilha_id     uuid      REFERENCES trilhas(id) ON DELETE CASCADE,
  titulo        text      NOT NULL,
  descricao     text      NOT NULL,
  ordem         integer   NOT NULL,
  xp_recompensa integer   DEFAULT 10
);

CREATE TABLE progresso_aluno (
  id               uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
  perfil_id        uuid      REFERENCES perfis_aluno(id) ON DELETE CASCADE,
  missao_id        uuid      REFERENCES missoes(id) ON DELETE CASCADE,
  status           text      NOT NULL CHECK (status IN ('pendente','concluida','falhada')),
  resposta         text,
  feedback_ia      text,
  xp_ganho         integer,
  atualizado_em    timestamp DEFAULT now()
);

CREATE TABLE conquistas (
  id        uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome      text    NOT NULL,
  icone     text,
  criterio  text
);

CREATE TABLE aluno_conquistas (
  id               uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
  perfil_id        uuid      REFERENCES perfis_aluno(id) ON DELETE CASCADE,
  conquista_id     uuid      REFERENCES conquistas(id) ON DELETE CASCADE,
  concedido_em     timestamp DEFAULT now()
);

CREATE TABLE notificacoes (
  id              uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
  destinatario_id uuid      REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo            text      NOT NULL,
  conteudo        text      NOT NULL,
  enviado_em      timestamp DEFAULT now(),
  lido_em         timestamp
);

CREATE TABLE foruns (
  id         uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo     text      NOT NULL,
  criado_em  timestamp DEFAULT now()
);

CREATE TABLE posts_forum (
  id         uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
  forum_id   uuid      REFERENCES foruns(id) ON DELETE CASCADE,
  usuario_id uuid      REFERENCES usuarios(id) ON DELETE CASCADE,
  conteudo   text      NOT NULL,
  criado_em  timestamp DEFAULT now()
);

CREATE TABLE configuracoes (
  chave   text PRIMARY KEY,
  valor   text
);

CREATE TABLE logs_auditoria (
  id          uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id  uuid      REFERENCES usuarios(id),
  acao        text      NOT NULL,
  detalhes    text,
  criado_em   timestamp DEFAULT now()
);

CREATE TABLE perfis_gestor (
  id             uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id     uuid      REFERENCES usuarios(id) ON DELETE CASCADE,
  escola_id      uuid      REFERENCES escolas(id) ON DELETE RESTRICT,
  cargo          text      NOT NULL DEFAULT 'Gestor',
  nivel_acesso   text      NOT NULL DEFAULT 'completo',
  data_vinculo   timestamp DEFAULT now()
);

CREATE TABLE relatorios (
  id                uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo            text      NOT NULL,
  tipo              text      NOT NULL,
  escola_id         uuid      REFERENCES escolas(id) ON DELETE CASCADE,
  turma_id          uuid      NULL,
  periodo           text      NOT NULL,
  metricas          text[]    NOT NULL,
  formato           text      NOT NULL,
  usuario_id        uuid      REFERENCES usuarios(id),
  url_arquivo       text      NULL,
  data_geracao      timestamp DEFAULT now()
);

CREATE TABLE cronogramas (
  id             uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
  escola_id      uuid      REFERENCES escolas(id) ON DELETE CASCADE,
  titulo         text      NOT NULL,
  descricao      text,
  data_inicio    timestamp NOT NULL,
  data_fim       timestamp NOT NULL,
  recorrencia    text,
  tipo           text      NOT NULL,
  criado_por     uuid      REFERENCES usuarios(id),
  criado_em      timestamp DEFAULT now()
);

CREATE TABLE configuracoes_escola (
  id             uuid      PRIMARY KEY DEFAULT uuid_generate_v4(),
  escola_id      uuid      REFERENCES escolas(id) ON DELETE CASCADE,
  chave          text      NOT NULL,
  valor          text      NOT NULL,
  atualizado_por uuid      REFERENCES usuarios(id),
  atualizado_em  timestamp DEFAULT now()
);