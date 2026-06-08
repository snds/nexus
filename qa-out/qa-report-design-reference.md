# QA Report — demo server vs. design references · audit/critique · lens:ui+ux · theme:dark

**Standard:** the project's own design sources in `design-source/` — `screenshots/` (the original Proofpoint flows) + the redesign's dark/circular language. References are authoritative for **layout, content structure, information hierarchy, and interaction patterns**; the dark + circular-node skin is the redesign's intentional divergence and is NOT scored against the light reference.
**Method:** side-by-side of 6 reference screens against the live build, plus **measured** live spacing/alignment (computed rects, not eyeballed) via `visual-qa-toolkit` + `visual-qa-ui-design`. Viewport 1440×900.

Reference screens loaded: `Open Detail Panel - Focused Node`, `Dashboard - My Saved Graphs`, `TAP Pivot Option 1`, `Settings-Privileges`, `Save Graph - Save failed`, `Actor Detail`, `Highlight Explorations`.

---

## A. Measured alignment & spacing (live) — what's solid

- **Dashboard card grid: pristine.** Cards uniform **322×176px**, **16px** gutters, **338px** column pitch, **192px** row rhythm (176 + 16). Columns land exactly at x = 80 / 418 / 756 / 1094. No sub-pixel drift, no inconsistent gaps. ✓
- **Detail-panel section headers: consistent.** "Forensics / Activity / Neighbor Nodes / Description" all render 11px with 0.275px tracking (uppercase eyebrow style). Inter-section gaps (119 / 95 / 94px) vary only with row count — expected, not a defect. ✓
- **Settings table, TAP tables:** column rhythm reads clean in capture; no measured misalignment.

The build's grid discipline is genuinely good. The findings below are mostly **fidelity-to-reference** and **refinement**, not broken pixels.

---

## B. Reference divergences (structure / content) — the substantive notes

### major

- **[major] Highlight-path uses a different mental model than the design.** `Highlight Explorations` accents the active path in **color** — path nodes get filled/emphasized treatment **and the connector edges along the path are highlighted** — while off-path nodes stay neutral grey but **fully legible**. The live build instead **dims off-path nodes to 25% opacity and leaves all edges unchanged**. Net effect: my version sacrifices peripheral awareness (analysts lose the surrounding context they're trying to reason about) and doesn't draw the eye along the actual *route*.
  Refine: (1) **highlight the path edges** — accent stroke color + heavier width along selected→ancestors and selected→descendants; (2) **accent the path nodes** (ring/glow or full-opacity + subtle scale) rather than only fading the rest; (3) soften the off-path treatment from 25% → ~45–55% so context stays readable. The path should *pop*, not the context *vanish*. · Owner: design-engineer

- **[major] Settings → Privileges is reframed away from its reference intent.** Reference `Settings-Privileges` is a **user-roster admin table**: User Email Address · Role dropdown (Account Admin ▾) · Revoke (✕) · "＋ Add New User", with the explanatory line about admin capability. The live pane shows a **read-only "Roles & Capabilities" matrix** (Capability · Required Role · Granted ✓) — useful, but it answers "what can *I* do," not "who has access," which is what Privileges governs.
  Refine: either restore the roster table (Add/Revoke/Role-assign) to match the reference's governance purpose, **or** rename the live pane "My Capabilities" and keep Privileges (roster) as a separate item, so the label doesn't over-claim. · Owner: design-engineer / ds-advisor

### minor

- **[minor] Save-failed pattern diverges.** Reference keeps the failure **inline in the dialog footer**: "Graph save failed." + **"Send bug report?"** link on the left, **RETRY** (text button) on the right — and has a dedicated `Save failed - report sent` follow-up. Live uses a separate red **banner** above the footer + **Dismiss / Retry** (filled). Refine: adopt the inline-footer treatment, add the "Send bug report?" affordance (+ its confirmation state), make Retry primary, and drop the heavyweight banner. Lower-friction, matches spec. · Owner: design-engineer
- **[minor] TAP "Insights" card is renamed.** Reference labels it **"Nexus Threat Explorer (NTX) Insights"**; live says **"Network Insights."** Align to "NTX Insights" for product-name continuity. · Owner: design-engineer
- **[minor] TAP "Attack Spread" loses precision.** Reference shows a **bucketed graded scale** (2 · 3–5 · 6 · 10+ · 20+ · 30+ · 40+ · 100 · 150+) with the active bucket called out; live shows a plain gradient bar + "84 customers." Refine: add the bucketed tick scale so the spread reads quantitatively, not just "more orange." · Owner: design-engineer
- **[minor] Detail panel Neighbor Nodes is 2-col; reference is a denser 3-col grid** (Malware / IP / SHA256 / Actor / Domains / Exploits / URLs). With richer entities the live 2-col grid will run tall. Refine: 3-column neighbor grid to match reference density and keep the panel compact. · Owner: design-engineer

---

## C. Refinement ideas (beyond what's literally wrong)

- **Canvas controls placement.** Reference clusters **recenter (crosshair) + zoom** bottom-right; live splits zoom (bottom-left) from the rest and adds a **minimap** (bottom-right) that the reference doesn't have — and which currently renders as an unthemed pale block on the dark canvas. Consider dropping the minimap in favor of the reference's tidy recenter+zoom cluster, or theme the minimap via `--xy-minimap-*`. Consolidating to one corner also builds muscle memory.
- **Trailing "New graph" ghost card.** The dashboard 4-col grid leaves empty slots with < 8 graphs (currently 7 → one gap). A dashed "＋ New saved graph" ghost card in the trailing slot fills the grid *and* adds a create affordance the reference lacks. Low effort, nice polish.
- **Node sublabels one step brighter.** Dark-theme node *titles* are white (good); the type sublabels ("ACTOR", "CAMPAIGN", "EMAIL ADDRESS") use `--nx-fg-subtle`, which the prior contrast pass measured at ~4.0:1 (under AA). Brightening the token (see `qa-report.md` major) also sharpens the node taxonomy at a glance.
- **Highlight toast lifecycle.** The "Highlighting attack path" toast doesn't auto-dismiss and lingers after toggle-off (stale). Auto-dismiss ~3s and clear on toggle-off.
- **Edge-label chips.** Live edge labels ("targets", "delivers") sit in light pills — good and legible. Consider matching the reference's lighter-weight, lower-contrast edge labels so relationship verbs recede behind node identity (right now they compete a little with node titles for attention).
- **Empty/long-name handling.** Reference deliberately tests "Truncate this graph name after 34…" — confirm the live card title truncation + tooltip matches (the live "Zloader Botnet 18 (US …" clips correctly; just verify a hover/title attr exposes the full name).

---

## Summary

Count — **2 major · 4 minor · 6 refinements.** Zero measured alignment/spacing defects — the grid system is tight. The substance is **fidelity to the reference's interaction models** (highlight strategy, Privileges governance) and **content precision** (TAP naming/scale, save-failed pattern), plus a set of polish moves that go past the spec (ghost card, control consolidation, toast lifecycle).

Score (fidelity to reference intent, dark-theme): **8/10.** Layout craft is excellent; the two majors are conceptual (how highlight reads, what Privileges governs) rather than cosmetic.

## Next
- `triage` → P1: highlight path-edges + soften dim (highest analyst-value, ties to the feature just shipped). P2: Privileges intent decision (ds-advisor) → table vs. rename. P3: TAP naming/scale + save-failed pattern + control/minimap consolidation.
- `spec` → hand the two majors to **design-engineer**; route the Privileges *intent* question to **ds-advisor** first.
- Companion: see `qa-out/qa-report.md` for the WCAG contrast audit (dark `--nx-fg-subtle` AA fail; light-canvas-label blocker).
