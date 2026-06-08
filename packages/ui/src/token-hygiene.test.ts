/**
 * Token hygiene guard — keeps the Radix migration from regressing. Scans DS + app source and
 * fails if anyone reintroduces (a) the old `hsl(var())` consumption pattern, or (b) raw Tailwind
 * palette color classes (`bg-blue-500`, `text-slate-400`…) instead of the `--nx-*` tokens.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { describe, it, expect } from "vitest";

function repoRoot(): string {
  for (const p of [resolve(process.cwd(), "../.."), resolve(process.cwd(), ".."), process.cwd()]) {
    if (existsSync(join(p, "pnpm-workspace.yaml"))) return p;
  }
  return resolve(process.cwd(), "../..");
}
const ROOT = repoRoot();
const SCAN_DIRS = ["packages/ui/src", "packages/graph/src", "apps/web/src"].map((d) => join(ROOT, d));

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    if (/\.(tsx?|css)$/.test(e.name) && !/\.test\.|\.d\.ts$/.test(e.name)) return [p];
    return [];
  });
}

const FILES = SCAN_DIRS.flatMap(walk);
const PALETTE =
  /\b(bg|text|border|ring|fill|stroke|from|to|via|decoration|outline|shadow|caret|accent)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/;

describe("token hygiene", () => {
  it("scans a non-trivial number of source files", () => {
    expect(FILES.length).toBeGreaterThan(20);
  });

  it("no `hsl(var(...))` consumption (use var() + color-mix)", () => {
    const offenders = FILES.filter((f) => readFileSync(f, "utf8").includes("hsl(var("))
      .map((f) => f.replace(ROOT + "/", ""));
    expect(offenders, `hsl(var()) found in:\n${offenders.join("\n")}`).toEqual([]);
  });

  it("no raw Tailwind palette color classes (use --nx-* tokens)", () => {
    const offenders = FILES.filter((f) => PALETTE.test(readFileSync(f, "utf8")))
      .map((f) => f.replace(ROOT + "/", ""));
    expect(offenders, `raw palette classes found in:\n${offenders.join("\n")}`).toEqual([]);
  });
});
