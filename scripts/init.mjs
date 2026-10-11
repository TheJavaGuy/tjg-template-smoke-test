#!/usr/bin/env node
/**
 * One-shot bootstrap for projects created from TheJavaGuy/template-ghpages.
 *
 * Run once right after cloning, before `pnpm install`:
 *   node scripts/init.mjs [--description "One line"]
 *
 * Dependency-free. Deletes itself and the template-only files when done.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { argv, exit, stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";

const TEMPLATE_OWNER = "TheJavaGuy";
const TEMPLATE_NAME = "template-ghpages";
const TEMPLATE_DESCRIPTION =
  "Template for small static web apps: Vite+, TypeScript, Tailwind CSS 4, DaisyUI 5, GitHub Pages.";
const AUTHOR_URL = "https://thejavaguy.org";

const SUBSTITUTED_FILES = ["package.json", "index.html", "README.md", "CLAUDE.md"];
const TEMPLATE_ONLY_FILES = ["CHANGELOG.md", "SPEC.md", "scripts/init.mjs"];

const root = resolve(import.meta.dirname, "..");

const log = (message) => stdout.write(`${message}\n`);
const warn = (message) => stdout.write(`! ${message}\n`);

function fail(message) {
  stdout.write(`\nerror: ${message}\n`);
  exit(1);
}

function run(command, args) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function tryRun(command, args) {
  try {
    return { ok: true, output: run(command, args) };
  } catch (error) {
    const stderr =
      error && typeof error === "object" && "stderr" in error ? String(error.stderr) : "";
    return { ok: false, output: stderr.trim() || String(error) };
  }
}

function detectRepository() {
  const origin = tryRun("git", ["remote", "get-url", "origin"]);
  const match = origin.ok ? origin.output.match(/[:/]([^/:]+)\/([^/]+?)(?:\.git)?\/?$/) : null;
  if (match) return { owner: match[1], name: match[2], source: "origin remote" };
  return {
    owner: TEMPLATE_OWNER,
    name: basename(root),
    source: "directory name (no origin remote)",
  };
}

function parseArgs() {
  const index = argv.indexOf("--description");
  if (index === -1) return {};
  const description = argv[index + 1];
  if (!description) fail("--description requires a value");
  return { description };
}

async function askDescription() {
  if (!stdin.isTTY) fail('stdin is not a terminal; pass --description "One line"');
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    for (;;) {
      const answer = (await rl.question("One-line project description: ")).trim();
      if (answer) return answer;
      log("Description must not be empty.");
    }
  } finally {
    rl.close();
  }
}

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Single-pass replacement so a new name that contains the old one is never rewritten twice. */
function substitute(text, replacements) {
  const pattern = new RegExp(replacements.map(([from]) => escapeRegExp(from)).join("|"), "g");
  const lookup = new Map(replacements);
  const counts = new Map(replacements.map(([from]) => [from, 0]));
  const result = text.replace(pattern, (match) => {
    counts.set(match, counts.get(match) + 1);
    return lookup.get(match);
  });
  return { result, counts };
}

function removeTemplateSection(readme) {
  const stripped = readme.replace(/<!-- template:start -->[\s\S]*?<!-- template:end -->\n?/, "");
  if (stripped === readme) warn("README.md: template section markers not found, nothing removed");
  return stripped;
}

function setAuthor(packageJsonText) {
  const pkg = JSON.parse(packageJsonText);
  const userName = tryRun("git", ["config", "user.name"]);
  const name = userName.ok && userName.output ? userName.output : pkg.author?.name;
  if (!name) warn("git user.name is unset; package.json author left unchanged");
  else pkg.author = { name, url: AUTHOR_URL };
  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function configureGitHub(owner, name, description, homepage) {
  if (!tryRun("gh", ["auth", "status"]).ok) {
    warn("gh is missing or not logged in. Manual steps:");
    warn(`  - set the repo description and homepage (${homepage})`);
    warn("  - Settings > Pages > Source: GitHub Actions");
    return;
  }
  const repo = `${owner}/${name}`;
  const edit = tryRun("gh", [
    "repo",
    "edit",
    repo,
    "--description",
    description,
    "--homepage",
    homepage,
  ]);
  if (edit.ok) log(`GitHub: description and homepage set on ${repo}`);
  else warn(`GitHub: could not edit ${repo}: ${edit.output}`);

  const pages = tryRun("gh", [
    "api",
    "-X",
    "POST",
    `repos/${repo}/pages`,
    "-f",
    "build_type=workflow",
  ]);
  if (pages.ok || /already exists/i.test(pages.output))
    log(`GitHub: Pages enabled on ${repo} (source: GitHub Actions)`);
  else
    warn(
      `GitHub: could not enable Pages (${pages.output}). Manual step: Settings > Pages > Source: GitHub Actions`,
    );
}

async function main() {
  const { owner, name, source } = detectRepository();
  if (name === TEMPLATE_NAME) fail(`refusing to run inside ${TEMPLATE_NAME} itself`);
  for (const file of [...SUBSTITUTED_FILES, "scripts/init.mjs"]) {
    if (!existsSync(join(root, file))) fail(`${file} missing; was init.mjs already run?`);
  }
  log(`Project: ${owner}/${name} (from ${source})`);

  const description = parseArgs().description ?? (await askDescription());
  const homepage = `https://${owner.toLowerCase()}.github.io/${name}/`;

  const replacements = [
    [`${TEMPLATE_OWNER}/${TEMPLATE_NAME}`, `${owner}/${name}`],
    [
      `${TEMPLATE_OWNER.toLowerCase()}.github.io/${TEMPLATE_NAME}`,
      `${owner.toLowerCase()}.github.io/${name}`,
    ],
    [TEMPLATE_NAME, name],
    [TEMPLATE_DESCRIPTION, description],
  ];

  for (const file of SUBSTITUTED_FILES) {
    const path = join(root, file);
    let text = readFileSync(path, "utf8");
    if (file === "README.md") text = removeTemplateSection(text);
    const { result, counts } = substitute(text, replacements);
    if (counts.get(TEMPLATE_NAME) === 0)
      fail(`${file}: template name not found; file was modified or already bootstrapped`);
    if (counts.get(TEMPLATE_DESCRIPTION) === 0)
      fail(`${file}: template description not found; file was modified or already bootstrapped`);
    writeFileSync(path, file === "package.json" ? setAuthor(result) : result);
    const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
    log(`${file}: ${total} replacements`);
  }

  for (const file of TEMPLATE_ONLY_FILES) {
    rmSync(join(root, file), { force: true });
    log(`removed ${file}`);
  }
  const scriptsDir = join(root, "scripts");
  if (existsSync(scriptsDir) && readdirSync(scriptsDir).length === 0)
    rmSync(scriptsDir, { recursive: true });

  configureGitHub(owner, name, description, homepage);

  run("git", ["add", "-A"]);
  const commit = tryRun("git", ["commit", "-m", "chore: bootstrap from template"]);
  if (commit.ok) log("committed: chore: bootstrap from template");
  else warn(`commit failed: ${commit.output}`);

  log(`\nDone. Next: pnpm install && git push\nSite will be published at ${homepage}`);
}

await main();
