# Final Degree Project — Cross-Media Social Catalog

A full-stack platform for discovering, cataloging, and discussing films, video games, and music. Developed as a Bachelor's thesis (TFG).

---

## Overview

Users can build personal collections across three media types, write reviews, follow other users, and receive recommendations based on shared taste profiles derived from vector embeddings. A real-time chat system allows direct communication between users.

---

## Tech Stack

### Frontend
- **Astro** — file-based SSR routing with island architecture
- **React 18** — interactive islands (chat, audio player, collections)
- **Tailwind CSS** — utility-first styling with custom design tokens and dark mode
- **Framer Motion** — UI animations
- **Eden Treaty** — end-to-end typed RPC client, no code generation required

### Backend
- **Bun** — runtime and package manager
- **ElysiaJS** — REST API and WebSocket server
- **Drizzle ORM** — type-safe database queries
- **Neon PostgreSQL** — serverless Postgres with `pgvector` extension
- **Vercel Blob** — avatar and image storage
- **bcryptjs** — password hashing

### External APIs
- TMDB (films)
- IGDB via Twitch (video games)
- Deezer + Genius (music and lyrics)

---

## Features

- **Catalogs** — real-time content fetched from TMDB, IGDB, and Deezer
- **Collections** — per-user lists grouped by media type, with inline item management
- **Reviews** — 1–5 star ratings with text comments; cascade-deleted on account removal
- **Social graph** — follow/following system with a friend-based user recommendation engine
- **User recommendations** — similarity score computed from shared collection vectors via pgvector
- **Chat** — real-time direct messaging over WebSockets with read receipts
- **Profiles** — customizable profiles, avatar upload to Vercel Blob, public pages at `/u/:id`

---

## Architecture

Bun workspaces monorepo:

```
apps/
  api/      # ElysiaJS backend — routes, services, Drizzle schema (port 3000)
  web/      # Astro + React frontend — pages, components, hooks (port 4321)
```

The frontend uses Eden Treaty to communicate with the backend with full TypeScript type inference. In SSR contexts, the API is called in-memory through the same Elysia instance, avoiding an HTTP round-trip.

---

## Local Setup

**Prerequisites:** Bun 1.x

```sh
# Install dependencies
bun install

# Start both servers concurrently
bun run dev
```

The API runs at `localhost:3000` and the frontend at `localhost:4321`.

### Environment Variables

Create a `.env.local` file at the project root:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `TMDB_API_KEY` | The Movie Database API key |
| `IGDB_CLIENT_ID` | IGDB (Twitch) client ID |
| `IGDB_CLIENT_SECRET` | IGDB (Twitch) client secret |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token |

### Sync Database Schema

```sh
cd apps/api
bun run drizzle-kit push
```

---

> This repository is part of an academic degree thesis and is subject to ongoing development.
