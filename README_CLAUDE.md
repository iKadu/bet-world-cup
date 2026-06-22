# Project: World Cup (Bolão)

## About the Project
A betting system (bolão) for the World Cup. Structured as a monorepo for high performance and scalability.

## Technology Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Quality**: Biome (Formatter/Linter) + Lefthook (Git Hooks)
- **UI**: shadcn/ui + Tailwind CSS

## Development Rules (Mandatory)
1. **Quality**: All code must pass `biome check`. If there are linting errors, fix them before completing the task.
2. **Structure**:
   - Maintain separate responsibilities by packages (packages/* and apps/*).
   - Reusable components must reside in `packages/ui`.
   - Database logic and schemas must reside in `packages/db`.
3. **Commits**: Follow the conventional commits pattern:
   - `feat:` for new features.
   - `fix:` for bug fixes.
   - `chore:` for maintenance tasks.
4. **Security**: Never hardcode API keys. Always use environment variables and the `@world-cup/env` package for validation.
5. **Accessibility**: When creating form components, ensure correct association between `label` and `input`. For generic components, use the Biome ignore comment: `// biome-ignore lint/a11y/noLabelWithoutControl:`.

## Folder Architecture
- `apps/web`: Next.js Frontend.
- `packages/db`: Database schema and migrations (Drizzle).
- `packages/ui`: Shared UI components.
- `packages/env`: Environment variables validation.