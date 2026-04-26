---
description: "Use when writing Astro components, pages, or layouts. Covers component composition, hydration, and styling."
applyTo: "**/*.astro"
---

# Astro Conventions

## Pages

- File-based routing in `src/pages/`
- Import components in the front-matter (`---`) block
- Use `<Layout>` wrapper for all pages

## Hydration

- Use `client:load` for React components that need immediate interactivity
- Keep Astro components static (no hydration) when possible — prefer islands architecture

## Layouts

- Shared layout in `src/layouts/Layout.astro`
- Import global CSS (`../styles/global.css`) in the layout
- Use `<slot />` for page content

## Styling

- Scoped styles via `<style>` tags in `.astro` files
- Tailwind utilities for layout and component classes
- Global styles in `src/styles/global.css`
