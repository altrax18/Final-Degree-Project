---
description: "Use when writing API routes, backend logic, or ElysiaJS handlers."
applyTo: "apps/api/**/*.ts"
---

# API Conventions (ElysiaJS + Bun)

## Framework

- Use ElysiaJS for the HTTP server
- Bun as runtime — use Bun APIs when available (e.g., `Bun.serve`, `Bun.file`)
- Database: Neon (serverless Postgres)

## Patterns

- Chain routes on the Elysia instance: `app.get("/path", handler)`
- Keep route handlers concise — extract complex logic into separate modules
- Use TypeScript types for request/response shapes
## Services

- Organize service logic into feature folders (e.g., `services/users/`)
- Split each operation into its own file: `create.ts`, `read.ts`, `update.ts`, `delete.ts`
- Always create an `index.ts` barrel export in each service folder to re-export all functions
- Import services from the folder directly: `import { createUser } from "../services/users"`