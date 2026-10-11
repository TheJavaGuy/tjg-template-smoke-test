/**
 * Light/dark switching for the DaisyUI themes declared in style.css.
 *
 * - No `data-theme` attribute: the `--prefersdark` theme follows the OS.
 * - A stored choice wins over the OS. index.html applies it inline before
 *   first paint; this module keeps the toggle and storage in sync.
 */
export const THEMES = { light: "tjg-light", dark: "tjg-dark" } as const;

export type ThemeName = (typeof THEMES)[keyof typeof THEMES];

export const THEME_STORAGE_KEY = "theme";

function isThemeName(value: string | null): value is ThemeName {
  return value === THEMES.light || value === THEMES.dark;
}

function readStoredTheme(): ThemeName | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeName(stored) ? stored : null;
  } catch {
    return null;
  }
}

function prefersDark(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches;
}

export function currentTheme(root: HTMLElement = document.documentElement): ThemeName {
  const attr = root.getAttribute("data-theme");
  if (isThemeName(attr)) return attr;
  return prefersDark() ? THEMES.dark : THEMES.light;
}

export function applyTheme(theme: ThemeName, root: HTMLElement = document.documentElement): void {
  root.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage unavailable (private mode, blocked). The theme still applies for this page view.
  }
}

export function setupThemeToggle(
  toggle: HTMLInputElement,
  root: HTMLElement = document.documentElement,
): void {
  const stored = readStoredTheme();
  if (stored) root.setAttribute("data-theme", stored);
  toggle.checked = currentTheme(root) === THEMES.dark;
  toggle.addEventListener("change", () => {
    applyTheme(toggle.checked ? THEMES.dark : THEMES.light, root);
  });
}
