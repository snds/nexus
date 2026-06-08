# QA Report — demo server (Nexus Threat Explorer) · audit · lens:ui+a11y · level:AA · theme:light+dark

**Standard:** WCAG 2.1 AA contrast (4.5:1 normal text · 3:1 large/non-text) + UI craft heuristics (states, alignment, theme parity).
**Method:** Contrast ratios computed deterministically from **live computed CSS colors** (not screenshot sampling — no anti-alias error), per `visual-qa-toolkit` contrast math, led by `visual-qa-ui-design` + `visual-qa-accessibility`. Viewport 1440×900. Views inspected: Graph, Dashboard, Detail panel, TAP pivot, Settings — in both themes.

Light theme was exercised by applying the shipped `:root.light` token override (the project's documented dark-first + `.light` model).

---

## Findings  (severity: blocker | major | minor | nit)

### blocker

- **[blocker] Light theme: on-canvas node titles & labels are illegible (1.22:1).** Every node title and on-canvas text (`rcastle@acme.com`, `Zloader Botnet 18`, `TA511`, `MALWARE`, `ACTOR`, …) renders `rgb(21,27,40)` on the black pane `rgb(0,0,0)` — measured **1.22:1**, far below the 4.5:1 floor. The names effectively disappear.
  Evidence: `GraphCanvas` pins `colorMode="dark"` so the React Flow pane stays black, but node-label text uses `--nx-fg`, which flips to a dark value under `:root.light`. Chrome (nav/top bar/legend) flips to light → a split-personality screen: light frame around a black canvas with invisible labels.
  Fix: inside the canvas, render node/edge label text from a token that does **not** invert with theme (e.g. a fixed `--nx-graph-fg` that stays light because the pane is always dark) — or let the pane follow the theme instead of pinning dark. · Owner: design-engineer (token + GraphNode) / ds-advisor (decide: themed canvas vs. always-dark canvas)
  Caveat on reach: **not user-reachable today** — no light-theme toggle is wired, so this is a latent defect. It becomes a true blocker the moment a theme switch ships. `tokens.css` already advertises `.light` as supported, so it's a real DS gap now.

### major

- **[major] Dark theme: `--nx-fg-subtle` fails AA for normal/small text.** The muted token `rgb(108,120,137)` measures **3.71–4.11:1** on dark surfaces (`rgb(20,23,31)`–`rgb(27,30,40)`) — below 4.5:1. Hits real secondary text: legend section labels ("THREAT", "VERDICT", "INDICATORS"), node sublabels, nav-rail idle icons, dashboard "Generated on … · N nodes" metadata, and the search placeholder (3.71:1).
  Fix: lighten `--nx-fg-subtle` to ≥ `rgb(139,148,158)` (~4.6:1 on the darkest surface) — one token change clears the whole class. · Owner: design-engineer (token layer; per CLAUDE.md "Never fork a token in a primitive — update at the token layer")

### minor

- **[minor] Dark theme: small verdict/status pip glyph below non-text 3:1.** The white `warning` glyph on the orange severity pill `rgb(244,136,42)` measures **2.5:1** (WCAG 1.4.11 non-text wants 3:1). The pip is a meaning-bearing indicator, not decorative.
  Fix: darken the pip glyph or deepen the orange one step; verify ≥3:1. · Owner: design-engineer
- **[minor] Stale toast: "Highlighting attack path" never auto-dismisses and lingers after highlight is toggled off.** The `note` state isn't cleared by `clearHighlight`/toggle-off, so the toast persists and goes stale (says "Highlighting…" while highlight is off).
  Fix: clear `note` on toggle-off and/or auto-dismiss after ~3s. · Owner: qa→design-engineer
- **[minor] React Flow minimap reads as a pale block** on the dark canvas (and clashes harder in light theme). It doesn't pick up the `--xy-*` theming the rest of the chrome uses.
  Fix: theme the minimap mask/background via `--xy-minimap-*` tokens. · Owner: design-engineer

### nit

- **[nit] Node title truncation:** "Zloader Botnet 18 (US …" clips with an ellipsis at the badge width. Expected for long names, but confirm the full name is available on hover/in the panel (it is, in the detail pane). No change required.

---

## Summary

Count — **1 blocker · 1 major · 3 minor · 1 nit**.
Contrast is the through-line: one token tweak (`--nx-fg-subtle`) clears the dark-theme AA failures; one architectural decision (themed vs. always-dark canvas) clears the light-theme blocker.

Score: **Dark theme 8.5/10** (ships well; muted-token AA fix outstanding). **Light theme 3/10** (chrome flips cleanly — 0 chrome contrast fails — but the graph canvas is unusable; gated behind an unwired toggle).

Verified **not** defects: Settings navigation (works via real click — earlier failures were `preview_click` harness flakiness, confirmed with native dispatch); Dashboard grid, Detail panel, TAP pivot, Settings all render cleanly with no contrast failures.

Annotated: measurements in `qa-out/measurements.json` (per-pair ratios). Screenshots captured in-session for Graph (dark/light), Dashboard, Settings, TAP.

---

## Next

- `triage` → phased plan: **Phase 1** (1 line each, high value): bump `--nx-fg-subtle`; clear stale `note`. **Phase 2:** decide canvas theming model (ds-advisor) → implement non-inverting graph-label token (design-engineer). **Phase 3:** minimap theming + pip glyph contrast.
- `spec` → hand the blocker + major to **design-engineer** as a token/architecture change set (do not fork tokens in primitives — fix at the token layer per CLAUDE.md).
- Recommended follow-up: `/qa audit story --theme light --theme dark` against the DS Storybook once the canvas-label token lands, to confirm both themes at the component level.
