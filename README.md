# tjg-template-smoke-test

Smoke test of the template bootstrap.

Live: https://thejavaguy.github.io/tjg-template-smoke-test/

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
