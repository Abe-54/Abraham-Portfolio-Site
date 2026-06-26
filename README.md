# Abraham Rubio — Portfolio

A fast, static personal portfolio for a full-stack developer (currently at the New Jersey Department of Community Affairs) who also makes indie games and builds with an AI-assisted workflow.

Refined, dark-first design with subtle gaming flair — the signature being a **gooey / metaball navigation**.

## Tech stack

- **[Astro 5](https://astro.build)** — static output, fast by default
- **TypeScript**
- **[Tailwind CSS v4](https://tailwindcss.com)** (CSS-first config, OKLCH palette)
- **React islands** — only where interactivity is needed (the nav + theme toggle)
- **[shadcn/ui](https://ui.shadcn.com)** primitives (Button, Badge)
- **[Motion](https://motion.dev)** — gooey nav animation
- Self-hosted fonts via Fontsource: **Hubot Sans** (display), **Mona Sans** (body), **Silkscreen** (pixel HUD accents)

## Getting started

```bash
pnpm install
pnpm dev      # http://localhost:4321
pnpm build    # static output to ./dist
pnpm preview  # preview the production build
```

## Editing content

All content is centralized and typed under `src/data/`:

- `site.ts` — name, role, headline, email, socials, nav links
- `experience.ts` — the timeline (NJDCA, education, NASA, early work)
- `projects.ts` — project cards
- `skills.ts` — skill groups (including the AI workflow group)

Images and the resume live in `public/`.

## Design system

Design context and principles are documented in [`.impeccable.md`](./.impeccable.md). Color tokens, type scale, spacing, and gaming-flair utilities live in `src/styles/global.css`.

## Deployment

Configured for static hosting on **Vercel** — connect the repo and deploy; no adapter or server runtime required.

## Project structure

```
src/
  components/
    Nav.tsx              # gooey navigation (React island)
    Footer.astro
    SectionHeading.astro
    sections/            # Hero, About, Timeline, Skills, Projects, Contact
    ui/                  # shadcn primitives
  data/                  # typed content
  layouts/Layout.astro   # head, fonts, theme script, goo SVG filter
  pages/index.astro
  styles/global.css
public/                  # images + resume.pdf
legacy/                  # archived previous Next.js site
```
