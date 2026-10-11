# template-ghpages

Template for small static web apps: Vite+, TypeScript, Tailwind CSS 4, DaisyUI 5, GitHub Pages.

Live: https://thejavaguy.github.io/template-ghpages/

<!-- template:start -->

## Template usage

Create a new project from this template (requires [`gh`](https://cli.github.com/) logged in, Node 24+, pnpm):

```sh
gh repo create NAME --template TheJavaGuy/template-ghpages --public --clone \
  && cd NAME && node scripts/init.mjs && pnpm install && git push
```

`scripts/init.mjs` runs once and then deletes itself. It:

1. Derives `owner/name` from the `origin` remote.
2. Asks for a one-line description.
3. Replaces the template name, URLs and description in `package.json`, `index.html`, `README.md`, `CLAUDE.md`.
4. Sets `package.json` `author` from `git config user.name`.
5. Removes this section, `CHANGELOG.md`, `SPEC.md` and itself.
6. If `gh` is authenticated: sets the GitHub repo description and homepage, and enables GitHub Pages with source "GitHub Actions".
7. Commits everything as `chore: bootstrap from template`.

Non-interactive: `node scripts/init.mjs --description "One line"`.

After the first push, the deploy workflow publishes the site. If Pages could not be enabled automatically, open the repo's Settings > Pages and set Source to "GitHub Actions", then re-run the workflow.

Then: replace `public/og-image.png` (1200x630) and the favicons, and, if you want analytics, set the repository variable `VITE_CLARITY_ID` (Settings > Secrets and variables > Actions > Variables).

Updating the template itself: edit, run `pnpm check && pnpm test && pnpm build`, note the change in `CHANGELOG.md`, push to `main`. The template deploys itself as the live demo above. Derived projects do not receive template updates.
<!-- template:end -->

## Development

Requirements: Node per `.nvmrc` (`nvm install` reads it) and pnpm 12 (`corepack enable` or `brew install pnpm`).

```sh
pnpm install
pnpm dev        # dev server with HMR
pnpm check      # format + lint + type check (add --fix to apply fixes)
pnpm test       # Vitest
pnpm build      # production build into dist/
pnpm preview    # serve dist/
```

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which checks, tests, builds and publishes `dist/` to GitHub Pages. `ci.yml` runs the same checks on pull requests and other branches. Dependabot opens weekly update PRs.

## Analytics

Microsoft Clarity loads only after the visitor accepts the consent banner, and only when `VITE_CLARITY_ID` is set at build time:

- locally: `VITE_CLARITY_ID=xxxx` in `.env.local` (git-ignored)
- in CI: repository variable `VITE_CLARITY_ID`

Unset means no banner and no analytics.

## Design

Themes, tokens, fonts and helper classes are documented in [DESIGN.md](DESIGN.md).

## License

[MIT](LICENSE)
