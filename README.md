# 🐦 SABIÁ RPG

**Sistema de Aprendizagem Baseada em Interação, Avaliação e Roleplay com Gamificação e Inteligência Artificial**

## 📚 Visão Geral

O **SABIÁ RPG** é uma plataforma educacional gamificada voltada para estudantes do Ensino Fundamental II e Ensino Médio das escolas públicas brasileiras. A proposta utiliza a estrutura dos jogos de RPG (Role-Playing Game) para tornar o processo de ensino mais envolvente, personalizado e significativo.

## 🎯 Objetivos

### Geral
Promover a aprendizagem ativa e o desenvolvimento de habilidades cognitivas e socioemocionais por meio de uma plataforma interativa com trilhas personalizadas e elementos de gamificação.

### Específicos
- Criar uma narrativa educativa gamificada baseada em RPG.
- Integrar inteligência artificial para personalizar conteúdos e fornecer feedbacks automáticos.
- Estimular o protagonismo, a empatia e o trabalho em equipe.
- Apoiar professores com relatórios pedagógicos personalizados.
- Oferecer acessibilidade digital e inclusão para todos os alunos.

## 💡 Funcionalidades Principais

- Cadastro e autenticação com perfis de aluno, professor e gestor.
- Sistema de trilhas de aprendizagem personalizadas com base em triagens diagnósticas.
- Avatares e narrativas interativas com evolução conforme o desempenho.
- Missões e desafios alinhados à BNCC.
- Sistema de pontuação, conquistas e rankings.
- Painel do professor com relatórios pedagógicos detalhados.
- Funcionalidade offline e acessibilidade para alunos com deficiência.
- Espaço interativo entre usuários (fórum, chat, mural de conquistas).

## 🧠 Metodologia

A plataforma é baseada em metodologias ativas como:
- **Gamificação**
- **Aprendizagem Baseada em Projetos (PBL)**
- **Design Thinking**
- **Scrum & Lean Startup**
- **Pesquisa-Ação**

## ⚙️ Requisitos Técnicos

### Funcionais
- Avaliação diagnóstica adaptativa.
- Personalização automática de conteúdos.
- Feedback em tempo real.
- Sistema de recompensas e evolução de avatar.
- Análises pedagógicas para docentes.

### Não-Funcionais
- Interface responsiva e acessível.
- Baixo consumo de dados e armazenamento.
- Suporte a múltiplos dispositivos.
- Segurança dos dados e conformidade com LGPD.
- Escalabilidade e manutenção modular.

## 🧪 Tecnologias Envolvidas (Proposta)

- **Frontend:** React + Tailwind + Figma (protótipo)
- **Backend:** Node.js + Supabase (PostgreSQL)
- **IA e automações:** OpenAI / modelos de IA educacional
- **Gamificação:** Estrutura narrativa baseada em RPGs
- **Design acessível:** WCAG + VLibras + contraste e leitura em voz

---

## 🗄️ Banco de Dados PostgreSQL (Ambiente de Desenvolvimento)

Este projeto usa o PostgreSQL gerenciado pelo Replit/Supabase para armazenamento de dados.

### Configuração do Banco

O banco de dados é automaticamente configurado através das variáveis de ambiente do Replit:
- `DATABASE_URL` - String de conexão completa
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - Credenciais separadas

### API de Teste (server/localApi.ts)

Uma API simples está disponível para testar a conexão com o banco:

```bash
# Iniciar a API de teste (porta 3000 por padrão):
tsx server/localApi.ts
```

### Endpoints de Teste

| Endpoint | Descrição |
|----------|-----------|
| `GET /health` | Retorna `{ ok: true, now: <timestamp> }` verificando conexão |
| `GET /usuarios` | Retorna até 10 registros da tabela usuarios |
| `GET /tables` | Lista todas as tabelas públicas do banco |

### Backup e Restauração

Os arquivos de backup do Supabase ficam em `./backup/`. Para restaurar:
1. Acesse o painel do Supabase
2. Use a funcionalidade de restauração nativa
3. Ou execute SQL diretamente pelo Drizzle Studio no Replit

### Scripts Disponíveis (para ambientes locais fora do Replit)

Os scripts em `scripts/` são projetados para ambientes locais com PostgreSQL instalado:
- `init_db.sh` - Inicializa cluster PostgreSQL
- `start_db.sh` - Inicia o servidor PostgreSQL
- `stop_db.sh` - Para o servidor PostgreSQL
- `restore_from_backup.sh` - Restaura backup .backup ou .backup.gz

**Nota:** Estes scripts funcionam apenas em ambientes com PostgreSQL nativo instalado. No Replit, use o banco gerenciado automaticamente.

### Limitações no Ambiente Replit

- O PostgreSQL é gerenciado pelo Replit - não é possível rodar instâncias separadas
- Use o Database Tool do Replit para gerenciamento visual
- Para desenvolvimento local fora do Replit, os scripts shell estão disponíveis

## 👥 Equipe

- **Estudantes:**  
  - Maysa Feitosa de Araújo  
  - Kaua Carvalho Oliveira  
  - Jhonata Levy da Silva Santos  
  - Karielly Ramos da Silva  
  - Rodrigo Carvalho Santos  

- **Orientador:**  
  - Sebastião Sales Rodrigues Macedo

## 🏫 Instituição

- **CETI Paulistana** – 17ª GRE – Piauí

## 📆 Cronograma

O desenvolvimento seguirá ciclos de prototipagem e validação, com aplicação em escolas parceiras e feedback contínuo para aperfeiçoamento.

## 📄 Licença

Em processo de definição conforme o uso institucional. Projeto desenvolvido no contexto do **SEDUCKATHON – Seletiva de Projetos Inovadores da SEDUC-PI**.

---

> “Assim como o sabiá canta alto e voa longe, acreditamos que a educação pode alçar novos voos — mais conectada, mais humana e mais transformadora.”
