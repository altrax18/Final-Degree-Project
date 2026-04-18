---
description: "Use when writing styles, Tailwind classes, or choosing colors. Defines the app's dark and light theme palettes."
applyTo: "**/*.{tsx,astro,css}"
---

# Tailwind Theme — Color Palette

The app supports dark and light themes. Custom colors are defined in `src/styles/global.css` via `@theme` and available as Tailwind utilities (e.g., `bg-abyss`, `text-screen`).

## Dark Theme — "Abyss"

Minimalistic palette with pure blacks and whites.

| Token          | Hex       | Tailwind class          | Usage                    |
|----------------|-----------|-------------------------|--------------------------|
| abyss          | `#000000` | `bg-abyss`              | Background base          |
| obsidian       | `#0A0A0A` | `bg-obsidian`           | Surface                  |
| coal           | `#141414` | `bg-coal`               | Cards / Elevated         |
| night-edge     | `#262626` | `border-night-edge`     | Borders / Dividers       |
| screen         | `#FFFFFF` | `text-screen`           | Primary text             |
| mist           | `#A0A0A0` | `text-mist`             | Secondary text           |
| electric-sky   | `#5BB5F5` | `text-electric-sky`     | Primary accent           |
| sapphire       | `#2E7CC9` | `bg-sapphire`           | Medium accent            |
| depth          | `#163D69` | `bg-depth`              | Accent background / Hover|

## Light Theme — "Silver Screen"

| Token          | Hex       | Tailwind class          | Usage                    |
|----------------|-----------|-------------------------|--------------------------|
| parchment      | `#FAFAF8` | `bg-parchment`          | Background base          |
| linen          | `#F3F0EB` | `bg-linen`              | Surface                  |
| sand           | `#EBE8E0` | `bg-sand`               | Cards / Elevated         |
| bone           | `#DDD9D0` | `border-bone`           | Borders / Dividers       |
| ink            | `#18181C` | `text-ink`              | Primary text             |
| slate          | `#6B6777` | `text-slate`            | Secondary text           |
| orchid         | `#C4A7E0` | `text-orchid`           | Primary accent           |
| amethyst       | `#8B6FBD` | `bg-amethyst`           | Medium accent            |
| lilac-mist     | `#EDE5F8` | `bg-lilac-mist`         | Accent background / Hover|

## Usage

- Use theme token classes (`bg-abyss`, `text-screen`) — not Tailwind defaults (`indigo-600`, `gray-200`)
- Never use arbitrary hex values for theme colors — always use the token name
- Colors are subject to change; using tokens ensures updates propagate automatically
