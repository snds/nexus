/**
 * Token contrast guard — locks the Radix step-contract contrast guarantees so they can't
 * regress. Parses @nexus/tokens, resolves each semantic alias through its var() chain to a
 * concrete hex, and asserts WCAG AA for every text/solid pairing in BOTH themes.
 *
 * This is the automated counterpart to the /qa contrast sweep: text must come from steps 11/12
 * (AA), solids must pair with a verified contrast color. The single documented exception is the
 * destructive solid (Radix red-9 + white ≈ 3.9:1 — passes AA-large/APCA, see DDR DS-2026-004).
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { describe, it, expect } from "vitest";

function readTokens(): string {
  for (const p of [
    resolvePath(process.cwd(), "../tokens/src/tokens.css"), // run from packages/ui
    resolvePath(process.cwd(), "packages/tokens/src/tokens.css"), // run from repo root
    resolvePath(process.cwd(), "../../packages/tokens/src/tokens.css"),
  ]) {
    if (existsSync(p)) return readFileSync(p, "utf8");
  }
  throw new Error("tokens.css not found from " + process.cwd());
}
const tokensCss = readTokens();

function block(selector: string): Record<string, string> {
  // grab the FIRST `selector { ... }` block, parse `--name: value;`
  const re = new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\{([\\s\\S]*?)\\n\\}", "m");
  const body = tokensCss.match(re)?.[1] ?? "";
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/gi)) {
    const name = m[1], value = m[2];
    if (name && value) out[name] = value.trim();
  }
  return out;
}

const root = block(":root"); // primitives + dark semantics
const light = { ...root, ...block(":root\\.light") }; // light overrides on top of primitives

function resolve(token: string, map: Record<string, string>, depth = 0): string | null {
  if (depth > 10) return null;
  const v = map[token];
  if (!v) return null;
  const varMatch = v.match(/^var\((--[a-z0-9-]+)\)$/i);
  if (varMatch && varMatch[1]) return resolve(varMatch[1], map, depth + 1);
  if (/^#[0-9a-f]{6}$/i.test(v)) return v;
  return null; // color-mix / non-hex → not a text token, skip
}

const hex = (h: string): [number, number, number] =>
  [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
const lum = ([r, g, b]: [number, number, number]) => {
  const f = (x: number) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a: string, b: string) => {
  const L1 = lum(hex(a)), L2 = lum(hex(b));
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
};

// [foreground token, background token, min ratio]
const AA = 4.5;
const TEXT_PAIRS: [string, string, number][] = [
  ["--nx-fg", "--nx-bg", AA],
  ["--nx-fg-muted", "--nx-bg", AA],
  ["--nx-fg-subtle", "--nx-bg", AA],
  ["--nx-fg-muted", "--nx-surface-1", AA],
  ["--nx-accent-text", "--nx-bg", AA],
  ["--nx-accent-fg", "--nx-accent", AA], // primary button (white on indigo-9)
];

for (const [themeName, map] of [["dark", root], ["light", light]] as const) {
  describe(`contrast · ${themeName}`, () => {
    for (const [fg, bg, min] of TEXT_PAIRS) {
      it(`${fg} on ${bg} ≥ ${min}:1`, () => {
        const f = resolve(fg, map), b = resolve(bg, map);
        expect(f, `${fg} unresolved`).toBeTruthy();
        expect(b, `${bg} unresolved`).toBeTruthy();
        expect(ratio(f!, b!)).toBeGreaterThanOrEqual(min);
      });
    }
    // Documented exception: destructive solid pairs at AA-large/APCA only (DDR DS-2026-004).
    it("--nx-destructive-fg on --nx-destructive ≥ 3.0 (documented exception)", () => {
      const f = resolve("--nx-destructive-fg", map), b = resolve("--nx-destructive", map);
      expect(ratio(f!, b!)).toBeGreaterThanOrEqual(3.0);
    });
  });
}
