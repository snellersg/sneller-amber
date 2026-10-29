# AMBER

Sneller Snow & Grounds sheets, docs, and process guides. Built with [Astro](https://astro.build) and [Starwind UI](https://starwind.dev), themed with the [Sneller brand](https://github.com/snellersg/sneller-brand).

## Develop

Requires Node 22.23.4+ (`nvm use` picks up `.nvmrc`).

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
npm run check    # type-check
```

## Editing content

| What | Where |
|---|---|
| Quick Access links | `src/data/docs.json`: categories, each with `title`, `description`, `url`. The app logo (Google Sheets, Docs, Monday.com, …) is picked from the URL. |
| Process guides | One markdown file per guide in `src/content/guides/`. Copy `_template.md` to start a new one; the file name becomes the URL (`/guides/<file-name>`). |

Guide frontmatter: `title`, `description`, `category` (required); `updated`, `owner`, `sourceUrl`, `draft` (optional). Drafts show in `npm run dev` but aren't built for production.

## Project layout

```
src/
  components/starwind/   Starwind UI components (manage with `npx starwind add|update`)
  content/guides/        Process guide markdown
  data/docs.json         Quick Access list
  layouts/BaseLayout.astro
  pages/                 /, /guides, /guides/[slug]
  styles/starwind.css    Tailwind + brand theme tokens
```

## Brand

Colors, type, spacing and radius come from `SNELLER_BRAND.md`. Use role classes (`bg-primary`, `text-muted-foreground`, …) instead of raw colors.
