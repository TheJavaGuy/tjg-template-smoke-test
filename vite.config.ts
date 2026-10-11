import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite-plus";

// GitHub Pages serves project sites under /<repo>/. deploy.yml sets BASE_PATH;
// local dev and custom-domain deployments use "/".
const base = process.env["BASE_PATH"] ?? "/";

export default defineConfig({
  base,
  plugins: [tailwindcss()],
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  test: {
    environment: "happy-dom",
    environmentOptions: {
      // External <script src> loads are disabled under happy-dom; treat them as loaded instead of logging errors.
      happyDOM: { settings: { handleDisabledFileLoadingAsSuccess: true } },
    },
  },
});
