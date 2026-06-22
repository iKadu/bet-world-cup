# WC26 Predictor — Bolão da Copa do Mundo 2026

Um bolão (pool de palpites) para a Copa do Mundo de 2026. Cada usuário cadastrado palpita o placar de cada partida do torneio (fase de grupos e mata-mata) e acumula pontos conforme os resultados reais vão saindo. Há um único ranking global — não existem bolões privados ou apostas em dinheiro, só pontuação e disputa entre os participantes.

## Como funciona

- **Cadastro/login** com email e senha.
- **Palpite de placar exato** em cada partida, editável livremente até o jogo começar.
- **Depois do primeiro palpite salvo, ele trava** — não é mais possível alterar.
- **Pontuação**, calculada automaticamente quando o resultado real é sincronizado:
  - **10 pontos** — acertou o placar exato.
  - **5 pontos** — acertou só o resultado (vitória de um dos dois lados ou empate), sem o placar exato.
  - **0 pontos** — errou.
- **Ranking global** com pódio para o top 3 e destaque para a sua posição.
- **Dashboard** com seu desempenho, os 3 próximos jogos que faltam palpitar, e a "confiança do grupo" (o que a galera está apostando em cada um desses jogos).
- **Multi-idioma** (Português/Inglês), com seletor no header.
- **Painel admin** para sincronizar manualmente os dados reais da Copa (times, grupos, partidas e resultados).

## Stack técnica

| Camada | Tecnologia |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) + TypeScript |
| Banco de dados | PostgreSQL + [Drizzle ORM](https://orm.drizzle.team/) |
| Autenticação | [Better Auth](https://www.better-auth.com/) (email/senha) |
| UI | [shadcn/ui](https://ui.shadcn.com/) (estilo `base-lyra`, sobre [Base UI](https://base-ui.com/)) + Tailwind CSS v4 |
| i18n | [next-intl](https://next-intl.dev/) (PT/EN, sem prefixo de URL) |
| Dados da Copa | [football-data.org](https://www.football-data.org/) (free tier) |
| Monorepo | [Turborepo](https://turbo.build/) + [Bun](https://bun.sh/) workspaces |
| Qualidade | [Biome](https://biomejs.dev/) (lint/format) + [Lefthook](https://github.com/evilmartians/lefthook) (git hooks) |

## Estrutura do projeto

```
apps/
  web/                    # Next.js App Router — único app do monorepo
    src/app/              # rotas: home, matches, predictions, leaderboard, sign-in/up, admin/sync
    src/components/       # header, theme toggle, language switcher
    src/lib/              # ranking, orquestrador de sync
    messages/             # pt.json / en.json (next-intl)

packages/
  auth/        # configuração do Better Auth (server + client) usando o schema do packages/db
  db/          # schema do Drizzle, upserts de sync e motor de pontuação
  env/         # validação de variáveis de ambiente (@t3-oss/env)
  football-data/  # cliente da API football-data.org + mapeamento para o nosso schema
  ui/          # componentes shadcn/ui compartilhados
  config/      # tsconfig base compartilhado
```

## Como rodar localmente

### Pré-requisitos

- [Bun](https://bun.sh/) 1.3+
- PostgreSQL 15+ rodando localmente (ou acessível via connection string)
- Uma chave gratuita da [football-data.org](https://www.football-data.org/client/register) (só é necessária se você quiser sincronizar dados reais)

### 1. Clonar e instalar

```bash
git clone git@github.com:iKadu/bet-world-cup.git
cd bet-world-cup
bun install
```

### 2. Configurar variáveis de ambiente

Copie o exemplo e preencha os valores:

```bash
cp apps/web/.env.example apps/web/.env
```

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string do Postgres |
| `CORS_ORIGIN` | URL do app (`http://localhost:3001` em dev) |
| `BETTER_AUTH_SECRET` | String aleatória de 32+ caracteres |
| `BETTER_AUTH_URL` | URL pública do app |
| `FOOTBALL_DATA_API_KEY` | Chave da football-data.org |
| `CRON_SECRET` | Segredo para autorizar a rota `/api/sync` |

### 3. Criar o schema do banco

```bash
bun run db:push
```

Isso cria todas as tabelas (usuários, sessões, times, grupos, partidas, palpites, log de sincronização). Para inspecionar o banco visualmente:

```bash
bun run db:studio
```

### 4. Rodar o app

```bash
bun run dev:web
```

Acesse [http://localhost:3001](http://localhost:3001) e crie uma conta em `/sign-up`.

### 5. Popular os dados da Copa

O banco nasce vazio — você precisa sincronizar os times/partidas reais da football-data.org. Isso só é possível por um usuário **admin**, e ninguém se autopromove pela interface por segurança. Promova sua própria conta direto no banco:

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'seu-email@exemplo.com';
```

Saia e entre de novo na aplicação para a sessão pegar a permissão, depois acesse `/admin/sync` e clique em **"Disparar sync manual"**. Isso importa todo o calendário da Copa 2026 (incluindo partidas já encerradas, com placar real).

> Não há sincronização automática agendada — a atualização dos dados é sempre disparada manualmente pela página de admin (ou chamando `POST /api/sync` com o header `Authorization: Bearer <CRON_SECRET>`).

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `bun run dev` | Roda todos os apps do monorepo em modo dev (via Turborepo) |
| `bun run dev:web` | Roda só o `apps/web` |
| `bun run build` | Build de produção de todo o monorepo |
| `bun run check` | `biome check --write` em todo o repositório |
| `bun run check-types` | Type-check de todos os pacotes |
| `bun run db:push` | Aplica o schema do Drizzle no banco configurado |
| `bun run db:studio` | Abre o Drizzle Studio (UI visual do banco) |
| `bun run db:generate` | Gera arquivos de migration a partir do schema |
| `bun run db:migrate` | Aplica migrations geradas |

## Deploy em produção

A aplicação está pronta para deploy na [Vercel](https://vercel.com/), com a raiz do projeto apontando para `apps/web`. Pontos importantes:

- O Postgres local não é acessível pela Vercel — use um provedor na nuvem (recomendado: [Neon](https://neon.tech/), que tem integração de um clique com a Vercel).
- Configure as mesmas variáveis de ambiente do `.env` nas configurações do projeto na Vercel, com o `DATABASE_URL` apontando para o banco de produção.
- Rode `bun run db:push` uma vez contra o banco de produção para criar as tabelas antes do primeiro deploy.
- Não há cron configurado — dispare a sincronização manualmente pela página `/admin/sync` sempre que quiser atualizar os dados.

## Convenções de código

- Todo código precisa passar em `biome check` (formatação e lint).
- Lógica de banco fica em `packages/db`; componentes de UI reutilizáveis em `packages/ui`.
- Commits seguem o padrão [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, ...).
- Variáveis de ambiente nunca são hardcoded — sempre via `@world-cup/env`.
