# NTX Design System — Component Reference

**Companion to:** `02-architecture-stack.md` · `03-redesign-work-order.md`
**Date:** 2026-06-04
**Status:** Consolidated. All node/graph components are variant-driven and Figma-mappable;
every variant is covered by a story and an axe test.

> **Read this when** authoring or consuming a Nexus UI component, or mirroring one into
> Figma. Components live in `packages/ui/src/components/nexus` and export from
> `@nexus/ui/nexus`. Everything is token-driven (no hardcoded color/space/radius —
> architecture §5 / tokens layer).

---

## 1. How this maps to Figma

Each component is authored so its **React props map 1:1 to Figma variant/component
properties**. The convention:

| React | Figma |
|---|---|
| String-union prop (`family`, `role`, `tone`, `verdict`) | **single-select variant property** (`Property=Value`) |
| Boolean prop (`selected`, `focused`, `hidden`, `vip`, `filled`) | **boolean variant property** (or a variable **mode** for interaction states) |
| Content prop (`label`, `glyph`, `colorToken`) | **text / instance-swap property** |
| Each `*.stories.tsx` named export | one **variant instance** on the Figma component set |

Interaction states (`selected`/`focused`/`hover`) are modeled as boolean props here; in
Figma prefer **variable modes** for them (design-engineer guidance) so the component set
doesn't combinatorially explode. The `data-*` attributes on each root (`data-slot`,
`data-family`, `data-verdict`, …) are the hooks for **Code Connect** to bind the Figma
component back to this code.

Stories are written **CSF3-shaped** against a local shim (`src/story-types.ts`) so there's
no Storybook dependency yet. Adopting Storybook is a one-line import swap
(`../story-types` → `@storybook/react`); the a11y addon would then complement the
automated axe suite below.

---

## 2. Component inventory (by altitude)

| Component | Kind | Export | Purpose |
|---|---|---|---|
| **`Icon`** | Primitive | `@nexus/ui/nexus` | A Material Symbol. Outlined by default; **`filled` only for active states**. Min size 20px for standalone controls. |
| **`Text`** | Primitive | ″ | Typography component — `variant` (display/h1–h3/title/body/body-sm/label/caption/overline/code) composed from the L0 type primitives; `tone` for color. The semantic type layer. |
| **`ToolButton`** | Primitive | ″ | Square icon control with built-in `Tooltip`. Shared by the top-right graph actions **and** the bottom-left zoom/fit/lock/motion controls. Variant: `active`. |
| **`Tooltip`** | Primitive | ″ | Real (DOM) hover/focus tooltip — not the browser `title`. Variant: `side` (top/bottom/left/right). Wrap any icon-only control. |
| **`EntityIcon`** | Primitive | ″ | EntityType → glyph, colored by entity token. `filled` for active. |
| **`ShapeIcon`** | Primitive | ″ | Family silhouette (legend key). |
| **`VerdictBadge`** | Primitive | ″ | Severity as a tinted pill + text. |
| **`VerdictPip`** | Primitive | ″ | Severity dot for a node badge. |
| **`CountChip`** | Primitive | ″ | Compact "+N" numeric chip. |
| **`StatCircle`** | Primitive | ″ | Ringed KPI (DLP / logins / phishing …). |
| **`Pill`** | Primitive | ″ | Compact rounded tag. |
| **`NodeBadge`** | Primitive (composite) | ″ | **THE node.** Variant-driven; the Figma "Node" component set. |
| **`GraphNode`** | Adapter | ″ | Binds an `Entity` → `NodeBadge`. Renders inside the canvas. |
| **`GraphLegend`** | Composite | ″ | Dynamic legend (families → verdict → indicators). **Collapsed by default**; entity rows are bare larger icons (no shape-swatch). |

App-level composition (not DS primitives) lives in `apps/web/src/components`: `TopBar`,
`NavRail`, `NexusLogo`, `SearchBox`, `UserSummary`, `IocResultCard`, `Dashboard`, `DetailPage`,
`TapPivot`, `Settings`, `AppSwitcher`, `DateSelector`, `ProductUpdates`, dialogs. `UserSummary`
consumes the DS `StatCircle` + `Pill`; every icon-only control wraps the DS `Tooltip`; the
canvas chrome uses `ToolButton`.

> **Removed in this pass:** the rectangular `NodeCard` (dead — the canvas renders
> `GraphNode`) and the `lucide-react` dependency (superseded by Material Symbols).

---

## 3. NodeBadge — the node component set

`NodeBadge` is the centerpiece. It's a **pure presentational** component (no domain
imports); `GraphNode` is the thin `Entity →` adapter.

### Variant / state matrix

| Property | Type | Values | Channel |
|---|---|---|---|
| **`family`** | variant | `circle` · `square` · `diamond` · `hexagon` | shape = entity **family** |
| **`role`** | variant | `neighbor` · `hub` (larger glyph) | root/focus emphasis. **Both outlined** + share the translucent fill; hub differs by size + glyph scale |
| **`verdict`** | variant | `malicious` · `phishing` · `suspicious` · `medium` · `benign` · `unknown` · *(omit = no pip)* | severity (own channel) |
| **`selected`** | state | boolean | strong accent ring + filled glyph |
| **`focused`** | state | boolean | soft accent ring |
| **`hidden`** | state | boolean | 50% opacity |
| **`vip`** | flag | boolean | ★ chip in the indicator cluster |
| **`status`** | flag | `at_risk` · `impacted` | recipient marker in the cluster |
| **`imposter`** | flag | boolean | masquerade marker in the cluster |
| **`hiddenChildren`** | count | number | "+N" chip (0 → none) |
| `colorToken` · `glyph` · `label` · `sublabel` | content | — | type color / Material Symbol / text |

**Fill + indicators:** every node fills with the shared `--nx-node-fill` (translucent app-bg)
behind a `--nx-node-blur` backdrop blur, so edge lines passing behind a node recede. All
indicators (verdict · flags · +N) are **combined into one top-right cluster** (each with a
`Tooltip`), never scattered to four corners. Hover scales the **shape + glyph only** (the
`.nx-shape` group); the cluster and labels hold steady.

### State contract
- **Precedence:** `selected` ⟩ `focused` for the ring; `selected || hub` drives the
  **filled** glyph (icon house-rule). `hidden` is orthogonal (composes with any).
- **Color = type**, **shape = family**, **verdict = its own pip** — the three channels
  never collide (architecture §5). The hub reverses to a filled badge but **keeps its
  family shape** (zero exceptions → the legend stays trustworthy).
- Sub-primitives: the badge composes `Icon`, `VerdictPip`, and `CountChip`.

Coverage: `NodeBadge.stories.tsx` enumerates all four families, hub, the three states,
hex-selected (SVG halo path), VIP, the count chip, and the no-pip case.

---

## 4. Token usage

Every value resolves through the token layer (`--nx-*`, `--entity-*`, `--severity-*`).
Notable bindings:

- **Tiers** → L0 primitives (`--nx-neutral-1…12`, `--nx-accent-1…12` ramps; the type scale
  `--nx-text-*` / `--nx-weight-*` / `--nx-leading-*` / `--nx-tracking-*`; entity/severity palettes)
  → L1 semantics that **alias** them (`--nx-bg: var(--nx-neutral-1)`, `--nx-accent: var(--nx-accent-9)`, …).
  Light mode re-points the primitive ramps; semantics follow.
- **Typography** → the `Text` component is the semantic type layer (variant → primitives).
- **Family color** → `--entity-{colorToken}` (e.g. `--entity-malware`).
- **Verdict** → `--severity-{verdict}` (pip, badge, stat tone).
- **Backgrounds (two Radix-style contexts)** → `--nx-bg` (step 1: app **and** graph canvas,
  cool near-black) and `--nx-surface-1` (step 2: panels/cards lift off the canvas).
  `--nx-surface-2/3` are popover/hover. The canvas pane binds `--nx-bg` (+ `--xy-background-color`).
- **Borders / text** → `--nx-border*`, `--nx-fg*` (`--nx-fg-subtle` is ≥4.5:1 AA on dark).
- **Active accent** → `--nx-accent` (rings, nav active, highlighted edges).
- **Node treatment** → `--nx-node-fill` (translucent shared fill) + `--nx-node-blur` (backdrop blur).
- **Motion** → `--nx-motion-fast|base|slow` + `--nx-ease-out|standard`. Standard chrome
  transitions reference these; the canvas adds a reviewable preset layer on top (see §6).

No component hardcodes a hue, blur, or duration. React Flow chrome is themed via RF's `--xy-*`
vars bound to these tokens (see `apps/web/src/styles.css`).

---

## 5. Verification (automated)

| Check | Command | Covers |
|---|---|---|
| Stories typecheck | `pnpm turbo run typecheck --filter=@nexus/ui` | every variant's props are valid |
| **a11y (axe)** | `pnpm turbo run test --filter=@nexus/ui` | **62 tests** — renders every story variant, asserts no axe violations |
| Lint | `pnpm turbo run lint` | DS code standards |

The axe harness (`src/a11y.test.tsx`) auto-discovers every `*.stories.tsx`, renders each
named export, and runs axe with page-level rules disabled (snippets aren't pages). jsdom
can't compute layout, so visual rules (color-contrast) return *incomplete*, not failures —
structural/ARIA rules (names, roles, labels, `aria-*`) are enforced.

> **New-component checklist (working agreement):** add the component → add a
> `*.stories.tsx` enumerating its variants → it's automatically axe-tested → add/extend a
> row in §2/§3 here.

---

## 6. Adopting Storybook later

The stories are already CSF3. To stand up a live catalog + the Storybook a11y addon:
1. `pnpm add -D storybook @storybook/react-vite @storybook/addon-a11y @storybook/addon-essentials` (in `@nexus/ui`).
2. Swap `../story-types.js` → `@storybook/react` in each `*.stories.tsx`.
3. Add `.storybook/main.ts` + `preview.ts` importing `@nexus/tokens/index.css` + Tailwind so tokens render.
4. Wire **Code Connect** using the `data-slot` / `data-*` hooks to bind Figma components → these React components.

---

## 7. Canvas motion

Node positions are tweened in **JS** (rAF) in `GraphCanvas`, so edges stay locked to node
centers and never draw ahead of an arriving node. On a command, **new nodes start at their
parent's position and travel out** (staggered); existing nodes glide to re-layout targets.
The connecting edge for a new node stays hidden until that node lands, then fades in. The
shape+glyph scale-in (`.nx-shape`) and the label/indicator fade-in (`.nx-after-land`) are CSS
beats keyed off the same per-node delay. All motion respects `prefers-reduced-motion`.

**Presets** (reviewable on-canvas via the Motion panel; default **Floaty**):

| Preset | Feel | Duration | Easing |
|---|---|---|---|
| Smooth | calm ease-out (most node tools) | 300ms | `easeOutQuint` |
| **Floaty** (default) | gentle spring, slight overshoot | 440ms | `easeOutBack` |
| Snappy | fast, crisp | 170ms | `easeOutCubic` |
| Instant | none (also the reduced-motion path) | 0ms | — |

The presets are an intentional **exploration layer** on top of the `--nx-motion-*` tokens
(§4) — not duplicate tokens. Standard chrome transitions (edge fade, hovers) use the tokens.

---

## 8. Design Decision Records

### DS-2026-001 — Light-theme graph canvas legibility

--- METADATA ---
DDR-ID: DS-2026-001 · Date: 2026-06-07 · Status: Active · Altitude: Tactical · Severity: Critical (resolved)
Component: GraphCanvas / tokens · Context-Quality: Confirmed
--- END METADATA ---

**Context.** A prior QA audit flagged a blocker: in light theme, on-canvas node labels
measured **1.22:1** — the React Flow pane was pinned black (`colorMode="dark"`) while label
text used `--nx-fg`, which inverts to dark under `:root.light`. Latent (no light toggle wired)
but a real DS gap since `tokens.css` ships `.light` as supported.

**Decision.** Bind the canvas surface to the **`--nx-bg` token** (via the RF `style` background
+ `.react-flow { background-color }` + `--xy-background-color`) instead of relying on RF's
pinned dark pane. The canvas now follows the theme like the rest of the chrome.

**Rationale.** Keeps the canvas in the same two-context background system as the chrome
(`--nx-bg` step 1 / `--nx-surface-1` step 2). Verified in light theme: pane `rgb(252,252,253)`,
titles `rgb(21,27,40)` → **16.8:1**. A non-inverting `--nx-graph-fg` token is therefore
**unnecessary** — the theme-aware background is the cleaner fix.

**Tradeoffs.** `colorMode="dark"` still pins RF's *internal* chrome defaults; our custom nodes,
edges, and overlays are token-driven so they theme correctly regardless. Acceptable.

**Deferred.** Wire an actual light/dark toggle (out of scope for the demo); re-verify edge
stroke contrast in light at that point.

### DS-2026-002 — Settings › Privileges intent

--- METADATA ---
DDR-ID: DS-2026-002 · Date: 2026-06-07 · Status: Active · Altitude: Tactical · Severity: High
Component: Settings (Privileges pane) · Context-Quality: Confirmed (reference screen)
--- END METADATA ---

**Context.** The reference `Settings-Privileges` is a **user-roster admin table** (User Email ·
Role ▾ · Revoke ✕ · ＋Add New User) — it governs *who has access*. The build had reframed the
pane as a read-only "Roles & Capabilities" matrix (*what I can do*), so the "Privileges" label
over-claimed.

**Decision.** Lead the pane with the **roster table** (matches the reference's governance
intent) and keep the capability matrix as a secondary **"Role capabilities"** section.

**Rationale.** Restores fidelity to the design's intent without discarding the useful capability
info. Roster actions (Revoke, Add) are figurative for the demo; Revoke carries a `Tooltip`.

**Tradeoffs.** Roster mutations are presentational (no backend). Acceptable for the demo.

**Deferred.** If this becomes real, wire role-change + revoke confirmation flows (the
`ConfirmDialog` already exists for the danger pattern).
