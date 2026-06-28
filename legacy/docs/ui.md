# UI System (shadcn/ui + Tailwind v4)

- Components: import from `@/components/ui/*`.
- Theme: site colors are mapped to shadcn tokens via CSS variables in `app/globals.css`.
- Dark mode: toggled by adding/removing `.dark` on `<html>` (see `context/theme-context.tsx`).
- Tokens to palette mapping:
  - `--primary` -> your brand `--color-primary` (#599fc0)
  - `--secondary` -> `--color-light-mode-secondary` / dark uses dark secondary
  - `--background`/`--foreground` map to light/dark base colors
- Build: Tailwind v4 with `@tailwindcss/postcss`. No `tailwind.config.ts` needed; customize in CSS.
- Buttons: `Button` supports `variant` and `size`. Prefer `asChild` for links.
- Forms: `Label`, `Input`, `Textarea`, `Select`.
- Navigation: `NavigationMenu` in `components/header.tsx`.
- Surfaces: `Card` in `components/project.tsx`.
- Badges/Chips: `Badge` in `components/skills-list.tsx`.

Conventions:

- Prefer semantic HTML; label inputs for a11y.
- Use `cn()` from `lib/utils.ts` for conditional classes.
- Keep imports from `react-icons`/`lucide-react` for icons.
