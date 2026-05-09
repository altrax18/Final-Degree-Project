---
description: "Use when writing any code in this project. Covers monorepo structure, tech stack, naming conventions, and general preferences."
applyTo: "**/*.{ts,tsx,astro,mjs,css}"
---

# Project Conventions

## Monorepo Structure

- Bun workspaces with `apps/api` (ElysiaJS) and `apps/web` (Astro + React)
- Package names: `@final-degree-project/api`, `@final-degree-project/web`
- Use `bun` as the package manager and runtime — never npm/yarn/pnpm

## Naming

- **Files**: PascalCase for components (`ChatButton.tsx`, `Layout.astro`), camelCase for utilities
- **Components**: PascalCase (`ChatWindow`, `MessageArea`)
- **Functions/variables**: camelCase (`sendMessage`, `activeConversation`)
- **Types**: PascalCase (`Conversation`, `Message`, `Props`)

## TypeScript

- Use `import type { ... }` for type-only imports
- Prefer explicit types over `any` — strict mode is enabled
- Target: ES2021+ features are available

## General Preferences

- Keep code concise and avoid over-engineering
- Prefer composition over inheritance
- Group related files in feature folders (e.g., `components/chat/`)
