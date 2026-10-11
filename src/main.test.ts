import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { THEME_STORAGE_KEY, THEMES } from "./theme.ts";

const read = (relative: string): string => readFileSync(new URL(relative, import.meta.url), "utf8");

const { name: projectName } = JSON.parse(read("../package.json")) as { name: string };
const html = read("../index.html");

function mountIndexHtml(): void {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  // main.ts is imported by the test itself; a <script type="module"> cannot load under happy-dom.
  for (const script of parsed.body.querySelectorAll("script")) script.remove();
  document.title = parsed.title;
  document.body.innerHTML = parsed.body.innerHTML;
}

describe("index.html + main.ts", () => {
  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    mountIndexHtml();
    vi.resetModules();
    await import("./main.ts");
  });

  it("renders the project name in the title and heading", () => {
    expect(document.title).toContain(projectName);
    expect(document.querySelector("h1")?.textContent).toContain(projectName);
  });

  it("switches and persists the theme via the toggle", () => {
    const toggle = document.querySelector<HTMLInputElement>("#theme-toggle");
    if (!toggle) throw new Error("#theme-toggle missing");

    toggle.checked = true;
    toggle.dispatchEvent(new Event("change"));
    expect(document.documentElement.getAttribute("data-theme")).toBe(THEMES.dark);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(THEMES.dark);

    toggle.checked = false;
    toggle.dispatchEvent(new Event("change"));
    expect(document.documentElement.getAttribute("data-theme")).toBe(THEMES.light);
  });
});
