# Changelog

All notable changes to this template are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Derived projects do
not carry this file.

## [Unreleased]

## [1.0.0] - 2026-10-11

### Added

- Vite+ 1.1.0 toolchain (dev, build, lint, format, test, type check).
- TypeScript 7.0.2, Tailwind CSS 4.3.3, DaisyUI 5.7.47, Vitest 5 with happy-dom.
- `tjg-light` / `tjg-dark` DaisyUI themes, self-hosted Fraunces + Manrope, type scale.
- Theme toggle with persisted choice and flash-free initial paint.
- Consent banner; Microsoft Clarity loaded only after consent and only when `VITE_CLARITY_ID` is set.
- GitHub Pages deploy workflow, CI workflow, Dependabot config.
- `scripts/init.mjs` bootstrap for derived projects.
- `CLAUDE.md`, `.claude/settings.json`, `DESIGN.md`, `SPEC.md`.
