# template-ghpages

Template for small static web apps: Vite+, TypeScript, Tailwind CSS 4, DaisyUI 5, GitHub Pages.

## Stack

- Vite+ (`vp`): dev server, build, Oxlint, Oxfmt, Vitest, type check. Config in `vite.config.ts` only; no `.oxlintrc`, no `vitest.config`.
- TypeScript 7 (type check only, `noEmit`). Plain `.js` modules are allowed (`allowJs`).
- Tailwind CSS 4 via `@tailwindcss/vite`; DaisyUI 5 as `@plugin` in `src/style.css`.
- Tests: Vitest through `vp test`, `happy-dom` environment, imports from `vite-plus/test`.
- pnpm (pinned in `package.json` `devEngines`), Node per `.nvmrc`.

## Commands

| Task                       | Command                            |
| -------------------------- | ---------------------------------- |
| Dev server                 | `pnpm dev`                         |
| Format + lint + type check | `pnpm check` (`--fix` to auto-fix) |
| Tests                      | `pnpm test`                        |
| Production build           | `pnpm build` (output in `dist/`)   |
| Preview build              | `pnpm preview`                     |

Run `pnpm check` and `pnpm test` before committing. CI runs exactly these plus `pnpm build`.

## Layout

- `index.html`: all markup. Static-first; JS only adds behaviour.
- `src/main.ts`: entry. `src/theme.ts`: light/dark toggle. `src/consent.ts`: consent banner + Clarity.
- `src/style.css`: Tailwind import, DaisyUI themes `tjg-light` / `tjg-dark`, fonts, type scale, `.wrap`, `.display`, `.num`, `.hairline`, `.soft`, `.kicker`, `.lead`. Tokens are documented in `DESIGN.md`.
- `public/`: favicons and `og-image.png` (1200x630), copied verbatim to `dist/`.

## Rules

- Use DaisyUI components and the theme tokens; do not hardcode colours.
- Fonts are self-hosted via `@fontsource-variable`. Never add Google Fonts or other third-party `<link>`/`<script>` tags.
- Third-party scripts load only after consent via `src/consent.ts`. Analytics id comes from `VITE_CLARITY_ID` (`.env.local` locally, repository variable in CI); the feature is inert when unset.
- Never hardcode the `/repo-name/` base path. `deploy.yml` sets `BASE_PATH`; `vite.config.ts` reads it. Use root-relative URLs (`/favicon.svg`) in `index.html` and let Vite rewrite them.
- Dependencies are pinned exact (`save-exact`); Dependabot proposes updates weekly. Do not loosen ranges.
- Deployment: push to `main` triggers `.github/workflows/deploy.yml` (GitHub Pages). Nothing is deployed from branches.
