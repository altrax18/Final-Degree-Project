---
description: "Use when writing React components (TSX). Covers component structure, props typing, hooks, and export patterns."
applyTo: "**/*.tsx"
---

# React Component Patterns

## Component Structure

```tsx
import { useState } from "react";

type Props = {
  onClose: () => void;
};

export default function ComponentName({ onClose }: Props) {
  const [state, setState] = useState(null);
  // ...
}
```

- Use `export default function` (not arrow functions or named exports)
- Define `type Props` above the component (not `interface`, not inline)
- Use `useState` for local state — no state library currently in use
- Destructure props in the function signature

## Styling

- Use Tailwind utility classes via `className` — no CSS modules, no styled-components
- Add `cursor-pointer` to interactive elements
- Use `transition-colors` for hover effects

## Accessibility

- Add `aria-label` to icon-only buttons
- Support keyboard interactions (`onKeyDown` for Enter)
- Use `disabled` state with `disabled:opacity-40` on buttons when appropriate

## SVG Icons

- Inline SVGs directly in JSX (no icon library)
- Standard icon props: `className="h-5 w-5"`, `fill="none"`, `stroke="currentColor"`
