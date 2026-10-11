# Design system

Two DaisyUI 5 themes declared in `src/style.css`. `tjg-light` is the default, `tjg-dark` applies when the OS prefers dark and no explicit choice is stored. The toggle in the header sets `data-theme` on `<html>` and stores the theme name under localStorage key `theme`.

## Colours

| Token               | tjg-light             | tjg-dark              |
| ------------------- | --------------------- | --------------------- |
| base-100            | `#f6f7f3`             | `#14232a`             |
| base-200            | `#ecefe8`             | `#0f1b21`             |
| base-300            | `#dbe0d7`             | `#1e323c`             |
| base-content        | `#16262d`             | `#e6ece8`             |
| primary / content   | `#0f5e6b` / `#e6f6f8` | `#4fb3c2` / `#06262c` |
| secondary / content | `#c9962b` / `#2b1f05` | `#e2b65a` / `#2b1f05` |
| accent / content    | `#3f7d5a` / `#eaf6ee` | `#6fbf8e` / `#06200f` |
| neutral / content   | `#16262d` / `#e8eeea` | `#e6ece8` / `#14232a` |
| info / content      | `#2f6f8f` / `#eaf4fa` | `#6aaed6` / `#06202c` |
| success / content   | `#2e8b57` / `#eaf7ef` | `#5cc08a` / `#06200f` |
| warning / content   | `#d08a1e` / `#2b1f05` | `#e3a33a` / `#2b1f05` |
| error / content     | `#b9372a` / `#fff1ef` | `#e06a5c` / `#2b0a06` |

Extra tokens (not part of DaisyUI, used by the helper classes below):

| Token         | tjg-light | tjg-dark  |
| ------------- | --------- | --------- |
| `--ink-soft`  | `#4b5f67` | `#a3b3ae` |
| `--hairline`  | `#cfd6ce` | `#2c414b` |
| `--gold-soft` | `#f3e4c2` | `#3a2f14` |
| `--teal-soft` | `#d8ebee` | `#153840` |

Shape: `--radius-box: 1rem`, `--radius-field: 0.5rem`, `--radius-selector: 1rem`, `--border: 1px`, `--depth: 0`, `--noise: 0`.

`<meta name="theme-color">` in `index.html` must match `base-100` of each theme.

## Typography

- Body: `Manrope Variable` (`--font-sans`, applied by Tailwind preflight), `font-feature-settings: "tnum"`.
- Display: `Fraunces Variable` (`--font-display`), used via `.display` (`SOFT` 40, tight tracking, line-height 1.02) and `.num` (`SOFT` 20, tabular figures).
- Both fonts are self-hosted from `@fontsource-variable/*`; no external font requests.

Type scale (`@theme`, usable as `text-*` utilities):

| Utility     | Size                                        | Line height           |
| ----------- | ------------------------------------------- | --------------------- |
| `text-sm`   | 0.833rem                                    | 1.5                   |
| `text-base` | 1rem                                        | 1.6 (1.5 below 640px) |
| `text-lg`   | 1.2rem                                      | 1.5                   |
| `text-xl`   | 1.44rem                                     | 1.3                   |
| `text-2xl`  | 1.728rem                                    | 1.2                   |
| `text-h3`   | clamp(1.2rem, 1.106rem + 0.417vw, 1.44rem)  | inherit               |
| `text-h2`   | clamp(1.44rem, 1.03rem + 1.823vw, 2.488rem) | inherit               |
| `text-h1`   | clamp(2.074rem, 1.203rem + 3.871vw, 4.3rem) | inherit               |

## Helper classes (`@layer components`)

| Class         | Purpose                                                                    |
| ------------- | -------------------------------------------------------------------------- |
| `.wrap`       | Content column: max 76rem, centred, 1.25rem side padding (2rem from 768px) |
| `.display`    | Fraunces heading style                                                     |
| `.num`        | Fraunces tabular numbers                                                   |
| `.hairline`   | Border colour `--hairline`; combine with `border` / `border-t`             |
| `.soft`       | Text colour `--ink-soft`                                                   |
| `.kicker`     | Small uppercase label above headings                                       |
| `.lead`       | Intro paragraph, `text-lg`, max 56ch                                       |
| `.navbar-top` | Translucent blurred sticky header with hairline bottom border              |

Accessibility baseline: visible `:focus-visible` outline in `primary`, 44px minimum button height on coarse pointers, animations disabled under `prefers-reduced-motion`.
