# QA Report — Nexus (entire project) · audit · lens: a11y + ui · level: AA · theme: dark + light

**Standard:** WCAG 2.2 AA (contrast 4.5:1 text / 3:1 large & non-text; names; targets), DS token + dogfood consistency.
**Method:** instrumented — axe structural suite (64 stories), live computed-style contrast sweep (relative-luminance ratios) on demo·docs·Storybook in both themes, tap-target + accessible-name enumeration, token math. Screenshots in this folder.
**Surfaces:** demo app (`@nexus/web`), docs (`@nexus/site`), Storybook (`@nexus/ui`).

---

## Findings (severity: blocker | major | minor | nit)

- **[major] Primary button text fails AA — system-wide.** White (`--nx-accent-fg`) on `--nx-accent` = accent-9 `205 90% 56%` (rgb 42,160,244) = **2.83:1** (need 4.5; also < 3.0 large). Every Default/primary button + accent CTA across demo ("Save"), docs ("Read the docs"), and Storybook.
  Fix: darken the *solid-fill* accent step (e.g. add `--nx-accent-solid` ≈ `205 90% 40–43%` for fills, keep accent-9 for text/borders on dark), or set `--nx-accent-fg` to a dark ink. · Owner: design-engineer (token)

- **[major] Destructive button text fails AA.** White on `--severity-malicious` (rgb 230,55,55) = **4.23:1** @14px normal. Same red backs the malicious channel.
  Fix: darken the red used as a *fill* (~ -8% L) or use dark ink on it. · Owner: design-engineer (token)

- **[major] Light theme — `--nx-fg-subtle` fails AA.** Node sublabels / captions (`EMAIL ADDRESS`, `CAMPAIGN`, `ACTOR`…) = rgb(115,130,150) on neutral-1 light = **3.82:1** (need 4.5). The dark-mode value was tuned to AA earlier; the light override (`--nx-neutral-9` light) was not — a theme-parity gap (cf. DDR DS-2026-001).
  Fix: darken light-mode `--nx-neutral-9` until ≥4.5:1 on `--nx-neutral-1`. · Owner: design-engineer (token)

- **[minor] Tiny severity indicator glyphs borderline.** White-on-red pip (`priority_high`) ≈ 4.23:1 @~10px. Exempt as non-text icons, but driven by the same red as the Destructive finding — one token fix covers both. · Owner: design-engineer

- **[nit] Maintenance / dependency hygiene.** Storybook 8.6.18 (10.4.0 available); GitHub Actions on Node 20 — runner forces Node 24 on **2026-06-16** (bump `actions/*` + `pnpm/action-setup`). Not user-facing. · Owner: qa→maintenance

- **[nit] Auditor false positives (informational).** Material Symbols ligatures (`hub`, `priority_high`) and alpha-background pills (accent "Design System" pill is accent-on-dark, legible) tripped the leaf-text contrast sweep — excluded from the counts above.

---

## Verified strengths (measured, not assumed)

- **Structural a11y clean:** 64/64 axe stories pass; **0** unnamed controls and **0** sub-24px targets on the demo. Icon-only controls all carry labels/tooltips.
- **Dark-theme text contrast:** clean across all surfaces.
- **Canvas light-theme bg:** 16.8:1 (DDR DS-2026-001 holds).
- **Dogfood consistency:** the flat-button fix (no UA bevel, no drop shadow) and the cool-neutral chrome render identically across demo + docs + Storybook.
- **Gate:** `typecheck test lint` green (15 tasks).

---

## Summary

Blocker 0 · **Major 3** · Minor 1 · Nit 2 · **Score: 82/100** (−18 for 3 AA contrast failures on high-traffic surfaces; structure, naming, targets, and dogfood are clean).
Annotated evidence: demo (dark/light), docs landing, Storybook button matrix in this folder.

## Next

`triage` → all three majors are **token-level edits in `@nexus/tokens`** (accent solid-fill step, malicious red, light neutral-9) — one focused pass, re-run this contrast sweep to confirm ≥4.5, re-add an axe-with-contrast check to lock it. Recommend handing to **design-engineer**; I can apply + re-verify on request. The Storybook/Actions bumps are independent maintenance.
