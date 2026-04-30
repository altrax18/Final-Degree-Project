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

## Icons

Use **Iconify** with the [Tabler icon set](https://icon-sets.iconify.design/tabler/) for all icons.

### In `.astro` files — use `astro-icon`

```astro
---
import { Icon } from "astro-icon/components";
---
<Icon name="tabler:movie" class="h-5 w-5" />
```

- Icons render as inline SVGs at build time — zero JS, zero runtime cost
- Size via Tailwind (`class="h-5 w-5"`) or the `size` prop
- Always add `aria-hidden="true"` on decorative icons

### In `.tsx` React components — use `@iconify/react`

```tsx
import { Icon } from "@iconify/react";

<Icon icon="tabler:sun" width={20} height={20} aria-hidden="true" />
```

### Icon naming

All icons use the `tabler:` prefix. Common ones used in this project:

| Purpose      | Icon name                  |
|--------------|----------------------------|
| Movies       | `tabler:movie`             |
| Music        | `tabler:vinyl`             |
| Games        | `tabler:device-gamepad-2`  |
| Groups       | `tabler:users-group`       |
| User profile | `tabler:user-circle`       |
| Sun (light)  | `tabler:sun`               |
| Moon (dark)  | `tabler:moon`              |
| Books / logo | `tabler:books`             |

Browse the full set at https://icon-sets.iconify.design/tabler/
