# World Cup Betting System (Bolão da Copa)

A robust full-stack monorepo for managing World Cup betting pools, built for performance and maintainability.

## 🏗️ Architecture Overview

This project uses a monorepo architecture managed by **Turborepo** to decouple the frontend from database operations while sharing logic and types seamlessly.

- **Framework**: Next.js (Full-stack with Server Actions)
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: TailwindCSS & shadcn/ui (Shared UI library)
- **Tooling**: Biome (Linting/Formatting) & Bun (Runtime/Package Manager)

## 📂 Project Structure

```text
world-cup/
├── apps/
│   └── web/         # Next.js Application (UI + API routes/Server Actions)
└── packages/
    ├── ui/          # Shared shadcn/ui components and styles
    └── db/          # Drizzle schema definition, migrations, and database client

--- 

    🚀 Getting Started
Prerequisites
Bun installed on your machine.

A PostgreSQL instance (Neon.tech or Supabase recommended).

Installation
Clone the repository and install dependencies:

Bash
   bun install
Setup environment variables:
Create a .env file in apps/web/ and add your database URL:

Plaintext
   DATABASE_URL=your_postgres_connection_string
Initialize Git hooks (for Biome linting/formatting):

Bash
   bun lefthook install
Push schema to the database:

Bash
   bun run db:push
Start development:

Bash
   bun run dev
🛠️ Development Workflow
Database Studio: Open the visual database editor with bun run db:studio.

Linting & Formatting: Run bun run check to validate all code via Biome.

Adding UI Components: Add new components via shadcn CLI pointing to the shared package:

Bash
  npx shadcn@latest add <component-name> -c packages/ui
💡 Note for AI Assistance
This project uses Drizzle ORM for database interaction and Next.js Server Actions for server-side logic. When asking for help, please specify if the logic belongs to the UI (Frontend) or should be handled via Server Actions (Backend/Database).