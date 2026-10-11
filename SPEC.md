# template-ghpages — specification

Template repository for small static web apps deployed to GitHub Pages.
This file is template-only: `scripts/init.mjs` deletes it in derived projects.

## 1. Purpose

One command creates a new, independent, deployable project with the full stack
configured, so that a new app starts at "write the first feature" instead of
"set up tooling". Derived projects are expected to drift from the template;
there is no upstream-sync mechanism.

## 2. Stack (versions pinned at creation, 2026-10-11)

| Component                                                       | Version                                   | Role                                                                                   |
| --------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------- |
| vite-plus (`vp`)                                                | 1.1.0                                     | dev server, build, lint (Oxlint), format (Oxfmt), test (Vitest), type check (tsgolint) |
| TypeScript                                                      | 7.0.2                                     | type checking only (`noEmit`); plain `.js` allowed via `allowJs`                       |
| Tailwind CSS + `@tailwindcss/vite`                              | 4.3.3                                     | utilities, theme tokens                                                                |
| DaisyUI                                                         | 5.7.47                                    | components, two custom themes                                                          |
| Vitest (via `vp test`)                                          | 5.0.3                                     | tests, `happy-dom` environment                                                         |
| pnpm                                                            | 12.11.2                                   | package manager, pinned in `devEngines`                                                |
| Node                                                            | `lts/*` in `.nvmrc`, `engines.node >= 24` | build-time only                                                                        |
| `@fontsource-variable/fraunces`, `@fontsource-variable/manrope` | latest                                    | self-hosted fonts                                                                      |

Dependabot keeps all of the above current (weekly, minor+patch grouped).

## 3. Repository layout

```
.
├── index.html                 markup lives here (static-first)
├── src/
│   ├── main.ts                entry: imports style, wires theme + consent
│   ├── theme.ts               light/dark toggle, localStorage "theme"
│   ├── consent.ts             consent banner, loads Clarity only after consent
│   ├── style.css              Tailwind + DaisyUI + tjg-light/tjg-dark + fonts + type scale
│   └── main.test.ts           smoke test: loads index.html, asserts title + toggle
├── public/                    favicon.svg, favicon-32.png, apple-touch-icon.png, og-image.png
├── scripts/init.mjs           one-shot bootstrap (template-only, self-deleting)
├── vite.config.ts             vite-plus config: tailwind plugin, base from BASE_PATH, vitest env
├── tsconfig.json              strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes + allowJs
├── package.json               scripts: dev, build, preview, check, test, lint, fmt
├── pnpm-workspace.yaml        vp-generated catalog (vite -> @voidzero-dev/vite-plus-core)
├── .npmrc .nvmrc .editorconfig .gitignore
├── .github/workflows/ci.yml  PRs + non-main pushes: install, vp check, vp test, vp build
├── .github/workflows/deploy.yml  main: same checks, build with BASE_PATH, deploy to Pages
├── .github/dependabot.yml
├── .claude/settings.json      enabledPlugins + permission allowlist
├── CLAUDE.md                  stack, commands, conventions
├── DESIGN.md                  theme tokens, fonts, type scale
├── README.md                  project README; "Template usage" section removed by init
├── CHANGELOG.md               template-only
├── SPEC.md                    this file, template-only
└── LICENSE                    MIT
```

## 4. Design system

Ported verbatim from `altersvorsorgedepot-calculator` (hex values kept):

- Two DaisyUI themes: `tjg-light` (`default`) and `tjg-dark` (`prefersdark`).
- Extra tokens per theme: `--ink-soft`, `--hairline`, `--gold-soft`, `--teal-soft`.
- Fonts: Manrope (body), Fraunces (display, `SOFT` 40), self-hosted.
- Type scale `--text-h1/h2/h3` (clamp) and sm..2xl overrides, exposed via `@theme`.
- Theme toggle: DaisyUI `swap` in the header; `data-theme` on `<html>`;
  persisted under localStorage key `theme`; no attribute set when the user has
  not chosen, so `prefers-color-scheme` applies. An inline `<head>` script
  applies the saved theme before first paint to avoid a flash.

## 5. Page boilerplate (`index.html`)

- `lang="en"`, viewport with `viewport-fit=cover`, `theme-color` per scheme.
- `description`, `canonical`, `og:*` (type, url, title, description, site_name,
  locale, image 1200x630 + alt), `twitter:*` (card, site, creator, image:alt).
- Icons: `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`.
- Header with project name and theme toggle; `main` with a component showcase;
  footer with author link.
- Consent banner (DaisyUI, theme-aware, English). Clarity is loaded only after
  "Accept"; the choice is stored under localStorage key `clarity-consent`
  (`granted` | `denied`). The whole feature is inert unless
  `VITE_CLARITY_ID` is set at build time (locally via `.env.local`, in CI via
  the repository variable `VITE_CLARITY_ID`).

## 6. Placeholders and substitution

The template is itself a working project. `init.mjs` rewrites, in this order:

1. `TheJavaGuy/template-ghpages` -> `<owner>/<name>`
2. `thejavaguy.github.io/template-ghpages` -> `<owner lowercased>.github.io/<name>`
3. `template-ghpages` -> `<name>`
4. the template description (constant `TEMPLATE_DESCRIPTION` in `init.mjs`) -> user-entered description

over: `package.json`, `index.html`, `README.md`, `CLAUDE.md`. The script fails
loudly if an expected replacement count is zero.

## 7. Bootstrap (`scripts/init.mjs`)

Dependency-free Node ESM. Runs before `pnpm install`.

1. Derive `<owner>/<name>` from `git remote get-url origin` (ssh or https);
   fallback owner `TheJavaGuy` + directory basename, with a warning.
2. Refuse to run when `<name>` is `template-ghpages`.
3. Prompt once for a one-line description (non-empty).
4. Apply the substitutions in §6.
5. Set `package.json` `author` to `{ name: git config user.name, url: https://thejavaguy.org }`.
6. Delete the "Template usage" section of `README.md` (between
   `<!-- template:start -->` and `<!-- template:end -->`).
7. Delete `CHANGELOG.md`, `SPEC.md`, `scripts/init.mjs`, and `scripts/` if empty.
8. If `gh` is available and authenticated: `gh repo edit --description --homepage`
   and `gh api -X POST repos/<owner>/<name>/pages -f build_type=workflow`.
   Each failure prints the manual step and continues.
9. `git add -A && git commit -m "chore: bootstrap from template"`.

## 8. Creation flow

```
gh repo create NAME --template TheJavaGuy/template-ghpages --public --clone \
  && cd NAME && node scripts/init.mjs && pnpm install && git push
```

## 9. CI/CD

- `ci.yml`: `pull_request` + `push` to branches other than `main`.
  Steps: checkout v7, pnpm/action-setup v6, setup-node v7 (`node-version-file: .nvmrc`, pnpm cache),
  `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm test`, `pnpm build`.
- `deploy.yml`: `push` to `main` + `workflow_dispatch`. Same steps, build with
  `BASE_PATH=/<repo>/` and `VITE_CLARITY_ID=${{ vars.VITE_CLARITY_ID }}`,
  then configure-pages v6, upload-pages-artifact v5 (`dist`), deploy-pages v5.
  `permissions: contents: read, pages: write, id-token: write`;
  `concurrency: group: pages, cancel-in-progress: false`.
- `dependabot.yml`: npm + github-actions, weekly, groups `minor-and-patch`.

## 10. Verification (definition of done)

1. `pnpm check`, `pnpm test`, `pnpm build` pass locally on the template.
2. Template pushed to `TheJavaGuy/template-ghpages`, marked as template, Pages
   enabled, deploy workflow green, demo URL returns HTTP 200.
3. Dry run: a throwaway repo created with the flow in §8; `init.mjs` output
   correct; CI green on the derived repo.
