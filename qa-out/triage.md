# QA Triage — single consolidated phase

Source: `qa-out/qa-report.md` (WCAG contrast) + `qa-out/qa-report-design-reference.md` (design-ref fidelity).
Ranked by **value ÷ effort**, deduped, sequenced so cheap high-clarity wins land first and shared edits (the token) happen once. Effort: XS ≤ a few lines · S ≤ ~1 file · M = multi-file/visual.

Two items are **decision-gated** (need a call before code) — listed at the end so they don't block the rest.

| # | Item | From | Sev | Effort | Owner | Change |
|---|------|------|-----|--------|-------|--------|
| 1 | Lighten `--nx-fg-subtle` | contrast major + sublabel refine | major | XS | DE | `rgb(108,120,137)` → ≥ `rgb(139,148,158)` at the token layer. Clears dark-theme AA fails on legend/nav/sublabels/dashboard-meta/placeholder **and** the "brighten node sublabels" refinement in one edit. |
| 2 | Highlight toast lifecycle | contrast minor + refine | minor | XS | DE | Clear `note` on highlight toggle-off; auto-dismiss ~3s. |
| 3 | TAP card rename | ref minor | minor | XS | DE | "Network Insights" → "NTX Insights" (Nexus Threat Explorer). |
| 4 | Verdict pip glyph contrast | contrast minor | minor | XS | DE | White `warning` glyph on orange pill is 2.5:1 (<3:1 non-text). Darken glyph or deepen orange one step → ≥3:1. |
| 5 | Edge-label chips recede | refine | nit | XS | DE | Lower weight/contrast on relationship verbs so they sit behind node identity. |
| 6 | **Highlight-path → match design model** | ref major | major | S–M | DE | Highlight path **edges** (accent stroke + width along ancestors+descendants); accent path **nodes** (ring/glow); soften off-path dim 25% → ~50%. Ties directly to the feature just shipped. |
| 7 | Neighbor Nodes 3-col | ref minor | minor | XS–S | DE | Detail-panel neighbor grid 2-col → 3-col to match reference density. |
| 8 | Save-failed pattern | ref minor | minor | S | DE | Move failure inline to dialog footer: "Graph save failed." + "Send bug report?" link (left), Retry primary (right); add report-sent confirm; drop the banner. |
| 9 | TAP Attack Spread scale | ref minor | minor | S | DE | Replace gradient + "84 customers" with bucketed tick scale (2·3–5·6·10+·20+·30+·40+·100·150+), active bucket called out. |
| 10 | Minimap → recenter/zoom cluster | contrast minor + refine | minor | S | DE | Drop the unthemed pale minimap; use reference's bottom-right recenter (crosshair) + zoom cluster; consolidate the split zoom controls. (Or, min-effort: theme minimap via `--xy-minimap-*`.) |
| 11 | Dashboard ghost card | refine | nit | S | DE | Dashed "＋ New saved graph" card in the trailing empty grid slot — fills the 4-col grid + adds create affordance. |

## Decision-gated (resolve before coding)

| G | Item | From | Sev | Owner | The call |
|---|------|------|-----|-------|----------|
| A | Light-theme canvas labels (1.22:1) | contrast **blocker** (gated: no theme toggle wired) | blocker | ds-advisor → DE | Themed canvas **or** always-dark canvas? Then add a non-inverting `--nx-graph-fg` for on-canvas text. Latent until a light toggle ships, but it's the only blocker — decide the model now, implement when a toggle is on the roadmap. |
| B | Settings/Privileges intent | ref major | major | ds-advisor → DE | Restore the user-roster admin table (Add/Revoke/Role) **or** rename the live pane "My Capabilities" so "Privileges" isn't over-claimed. Rename = XS; roster = M. |

## Sequencing (one pass)

1. **Token + copy batch (1–5):** all XS, no decisions, mostly independent — land together, re-run the contrast eval to confirm dark AA passes.
2. **Highlight-path (6):** the highest analyst-value change; builds on code shipped this session.
3. **Fidelity batch (7–9):** neighbor grid, save-failed, attack-spread.
4. **Polish (10–11):** minimap/controls, ghost card.
5. **Gated (A, B):** get the two decisions, then implement (B-rename is XS and could fold into batch 1 if "rename" is chosen).

Verification per batch: `pnpm -s turbo run typecheck test lint` (keep 15/15 green, 66 tests) + targeted preview re-check (contrast eval after batch 1; highlight edges/dim after 6).
