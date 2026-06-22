# WC26 Predictor — 2026 World Cup Prediction Pool

A prediction pool ("bolão") for the 2026 FIFA World Cup. Every registered user predicts the exact score of each match in the tournament (group stage and knockout rounds) and earns points as real results come in. There's a single global leaderboard — no private pools and no money involved, just points and bragging rights among participants.

## How it works

- **Sign up / sign in** with email and password.
- **Predict the exact score** of every match, freely editable until kickoff.
- **Once a prediction is saved, it locks** — it can no longer be changed.
- **Scoring**, calculated automatically once the real result is synced in:
  - **10 points** — exact score.
  - **5 points** — correct outcome only (win for either side, or draw), without the exact score.
  - **0 points** — wrong.
- **Global leaderboard** with a podium for the top 3 and a highlight for your own position.
- **Dashboard** showing your performance, the next 3 matches you haven't predicted yet, and "Group Confidence" (what everyone else is predicting for those same matches).
- **Multi-language** (Portuguese/English), with a switcher in the header.
- **Admin panel** to manually sync real World Cup data (teams, groups, matches, and results).

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) + TypeScript |
| Database | PostgreSQL + [Drizzle ORM](https://orm.drizzle.team/) |
| Authentication | [Better Auth](https://www.better-auth.com/) (email/password) |
| UI | [shadcn/ui](https://ui.shadcn.com/) (`base-lyra` style, built on [Base UI](https://base-ui.com/)) + Tailwind CSS v4 |
| i18n | [next-intl](https://next-intl.dev/) (PT/EN, no URL prefix) |
| World Cup data | [football-data.org](https://www.football-data.org/) (free tier) |
| Monorepo | [Turborepo](https://turbo.build/) + [Bun](https://bun.sh/) workspaces |
| Quality | [Biome](https://biomejs.dev/) (lint/format) + [Lefthook](https://github.com/evilmartians/lefthook) (git hooks) |

## Project structure

```
apps/
  web/                    # Next.js App Router — the monorepo's only app
    src/app/              # routes: home, matches, predictions, leaderboard, sign-in/up, admin/sync
    src/components/       # header, theme toggle, language switcher
    src/lib/              # ranking, sync orchestrator
    messages/             # pt.json / en.json (next-intl)

packages/
  auth/        # Better Auth setup (server + client), wired to the packages/db schema
  db/          # Drizzle schema, sync upserts, and the scoring engine
  env/         # environment variable validation (@t3-oss/env)
  football-data/  # football-data.org API client + mapping to our schema
  ui/          # shared shadcn/ui components
  config/      # shared base tsconfig
```

## Running locally

### Prerequisites

- [Bun](https://bun.sh/) 1.3+
- PostgreSQL 15+ running locally (or reachable via a connection string)
- A free [football-data.org](https://www.football-data.org/client/register) API key (only needed if you want to sync real data)

### 1. Clone and install

```bash
git clone git@github.com:iKadu/bet-world-cup.git
cd bet-world-cup
bun install
```

### 2. Configure environment variables

Copy the example file and fill in the values:

```bash
cp apps/web/.env.example apps/web/.env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `CORS_ORIGIN` | The app's URL (`http://localhost:3001` in dev) |
| `BETTER_AUTH_SECRET` | A random string, 32+ characters |
| `BETTER_AUTH_URL` | The app's public URL |
| `FOOTBALL_DATA_API_KEY` | Your football-data.org API key |
| `CRON_SECRET` | Shared secret used to authorize the `/api/sync` route |

### 3. Create the database schema

```bash
bun run db:push
```

This creates every table (users, sessions, teams, groups, matches, predictions, sync log). To browse the database visually:

```bash
bun run db:studio
```

### 4. Run the app

```bash
bun run dev:web
```

Visit [http://localhost:3001](http://localhost:3001) and create an account at `/sign-up`.

### 5. Populate the World Cup data

The database starts empty — you need to sync the real teams/matches from football-data.org. This can only be done by an **admin** user, and nobody can self-promote through the UI for security reasons. Promote your own account directly in the database:

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'your-email@example.com';
```

Sign out and back in so your session picks up the new role, then go to `/admin/sync` and click **"Trigger manual sync"**. This imports the full 2026 World Cup schedule, including matches that have already finished (with their real score).

> There's no scheduled automatic sync — data is always refreshed manually from the admin page (or by calling `POST /api/sync` with the header `Authorization: Bearer <CRON_SECRET>`).

## Available scripts

| Command | Description |
|---|---|
| `bun run dev` | Runs every app in the monorepo in dev mode (via Turborepo) |
| `bun run dev:web` | Runs only `apps/web` |
| `bun run build` | Production build of the whole monorepo |
| `bun run check` | `biome check --write` across the entire repository |
| `bun run check-types` | Type-checks every package |
| `bun run db:push` | Applies the Drizzle schema to the configured database |
| `bun run db:studio` | Opens Drizzle Studio (a visual database UI) |
| `bun run db:generate` | Generates migration files from the schema |
| `bun run db:migrate` | Applies generated migrations |

## Code conventions

- All code must pass `biome check` (formatting and linting).
- Database logic lives in `packages/db`; reusable UI components live in `packages/ui`.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, ...).
- Environment variables are never hardcoded — always accessed through `@world-cup/env`.
