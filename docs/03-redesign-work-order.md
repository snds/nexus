# NTX Redesign — Graph Canvas Work Order

**Companion to:** `02-architecture-stack.md`
**Date:** 2026-06-04
**Status:** Parts A, B & C **executed** and verified in-browser (C applied 2026-06-04). Open obligations tracked in §7.

> ### What this records
> An uplift of the graph canvas in three parts:
> **(A)** a dark-mode token remediation that fixed a theme-collision bug *(executed)*,
> **(B)** a redesign of the node language to the circular treatment from the source
> Sketch, with an at-a-glance legend *(executed)*, and
> **(C)** a second encoding channel — **shape = family** — layered on top of B
> *(§8, applied)*. Every applied change landed in the layer that owns it
> (architecture §1); no shadcn base (L1) or unrelated code was touched.

---

## 1. Scope

The demo rendered, but the graph canvas had two classes of problem:

1. **Dark-mode glare.** A bright minimap box, white edge-label pills, and near-invisible control glyphs — the canvas was visibly fighting the dark-first token system.
2. **Node language drift.** Nodes rendered as rectangular `NodeCard`s. The source design intent (`design-source/sketch/.../preview.png` + the node-treatment frames) is **circular icon badges, color = entity family, glyph disambiguates**, with a **legend** for at-a-glance decoding.

Both are now resolved. The canvas is coherently dark and speaks the circular node language.

---

## 2. Part A — Dark-mode token remediation

### 2.1 Root cause (one bug, many symptoms)

The "bright elements" were **not** independent chrome bugs. React Flow v12 stamps
`class="react-flow light"` on its canvas container by default (its `colorMode`
defaults to light). The token theme's light override was an **unscoped `.light`
selector** ([packages/tokens/src/tokens.css](../packages/tokens/src/tokens.css)),
so it matched RF's class and **re-themed the entire graph subtree into light mode**.
Inside the canvas, `--nx-bg` resolved to `210 30% 99%` (light) while the rest of the
app stayed dark. The white minimap, white edge-label backdrops, and dark-on-dark
control glyphs were all downstream symptoms of that single collision.

> Diagnosed by tracing the computed `--nx-bg` up the DOM: dark at `<html>`, light at
> `.react-flow`. The setter was RF's own `light` class, not any chrome default.

### 2.2 Fixes

| Fix | File | Rationale |
|---|---|---|
| Scope the theme override `.light` → `:root.light` | `packages/tokens/src/tokens.css` | Theme is a **document-level** concern. A bare `.light` collides with any third-party `light` class. This is the actual root-cause fix. |
| Pin the renderer to dark (`colorMode="dark"`) | `packages/graph/src/GraphCanvas.tsx` | Stops RF emitting `light`; selects RF's dark chrome defaults. Matches "`:root` IS dark" (tokens §header). |
| Bind RF chrome to NTX tokens via `--xy-*` vars | `apps/web/src/styles.css` | RF v12 themes through its own `--xy-*` custom properties; driving those (not fighting `fill` specificity) is the sanctioned path and keeps chrome token-sourced. |

**Why `--xy-*` and not `.react-flow__… { fill }`:** RF's internal rules read
`fill: var(--xy-…)`, and those rules win the cascade-layer fight against a plain
class override. Feeding the variable is both correct *and* "edit a token, not a
component."

---

## 3. Part B — Circular node redesign

### 3.1 Source intent → implementation

Read from `design-source/sketch/extracted/previews/preview.png` and the
node-treatment frames (`e4dbe755…png`, the dark constellation `91c42caf…png`):

| Source intent | Implementation |
|---|---|
| Circular icon badge; **color = entity type**, glyph disambiguates within family | `GraphNode` — ringed circular badge per `--entity-*` token + `EntityIcon` glyph |
| Solid-filled **central hub** with reversed (white) glyph | Densest-degree node → `hub` flag (adapter); filled disc, white glyph |
| **Verdict on its own channel** (architecture §5) | Severity **pip** on the badge via `--severity-*`, orthogonal to entity color |
| Aggregate "+N" groups | `aggregateCount` → count chip on the badge |
| "Visual indicators supported by a **legend** definition" | `GraphLegend` — dynamic key: families → verdict → role/indicators |
| Dark constellation aesthetic | Inherits Part A's dark canvas |

> **Channel model, as shipped in B:** color = type, glyph = type-within-family,
> verdict = pip, role = fill/size. Family is only a *legend grouping* here.
> **Part C (§8) promotes family to its own visual channel** — **shape = family** — so
> family is readable on the node itself, not just in the legend. B's channels are
> unchanged by C; C only adds shape.

### 3.2 New / changed components

| Component | Layer | Change |
|---|---|---|
| `GraphNode` | L3 (new) | The circular node treatment. Composes `EntityIcon`. Variants: hub / neighbor, states selected·focused·hidden, aggregate, verdict pip, VIP marker. |
| `GraphLegend` | L3 (new) | At-a-glance key. Dynamic — renders only the entity types + verdicts present on the canvas. Collapsible. Families are a **presentation grouping**, not a token fork. |
| `EntityIcon` | L3 | Additive optional `color` prop (white glyph for the filled hub). Backward-compatible. |
| `react-flow-adapter` | L4 | Renders `GraphNode` (was `NodeCard`); derives `hub` = densest degree; centered hidden handles. |
| `GraphCanvas` | L4 | Mounts `GraphLegend` in a `<Panel>`; per-side `fitViewOptions` padding; `colorMode="dark"`. |

> **L4 ⟂ L3 held throughout** (architecture §1): the canvas swapped *which* L3
> primitive it renders; it still owns zero pixels of node chrome. `NodeCard` is
> untouched and remains the primitive for list/detail contexts.

### 3.3 Legend-occlusion decision

The expanded legend (top-left `<Panel>`) covered a ring node (the IP) on load — an
always-on panel that hides a node is a usability defect. Resolved two ways, kept both:

1. **Collapsible legend** — header doubles as a toggle, so the panel can never
   *permanently* hide a node.
2. **Per-side `fitView` padding** — `{ left: 224px, top: 72px, right: 32px,
   bottom: 64px }` reserves the gutters for the legend / controls / minimap, so
   `fitView` never parks a node under overlay chrome. (React Flow v12.11 supports
   per-side padding.)

Verified: all 6 seed nodes clear of chrome after fit.

---

## 4. Decisions

> ### Decisions taken (2026-06-04)
> 1. **Theme class is document-scoped** (`:root.light`). Nested `.light` islands are
>    no longer supported — theme is a root concern. Prevents third-party class
>    collisions (RF was the first victim; won't be the last).
> 2. **React Flow pinned to `colorMode="dark"`.** The renderer is dark-first like the
>    tokens; light mode follows the document theme, not RF's default.
> 3. **Circular `GraphNode` is the canvas node treatment.** `NodeCard` is retained for
>    non-canvas (list/detail) use — not deleted.
> 4. **Legend families are presentation-only.** They group existing `--entity-*`
>    tokens for scanning; they do **not** define new color and do **not** depend on
>    the pending entity-family→color sign-off (tokens.css §header / discovery §9).

---

## 5. Verification

| Check | Command | Result |
|---|---|---|
| Typecheck | `pnpm turbo run typecheck --filter=@nexus/ui --filter=@nexus/graph --filter=@nexus/web` | ✅ pass |
| Graph tests | `pnpm turbo run test --filter=@nexus/graph` | ✅ 4/4 |
| In-browser (computed values) | preview inspect of `--xy-*` chrome + `--nx-bg` in canvas | ✅ dark throughout |
| Interaction | click node → selection ring + detail pane (Ops/Transforms/Actions) | ✅ |
| Layout | all 6 seed nodes clear of legend/controls/minimap after fit | ✅ |

---

## 6. File manifest

Parts A & B:
```
packages/tokens/src/tokens.css            .light → :root.light  (root-cause fix)
apps/web/src/styles.css                   RF chrome bound to --xy-* tokens
packages/ui/src/components/nexus/
  GraphNode.tsx                           NEW — circular node treatment (L3)
  GraphLegend.tsx                         NEW — at-a-glance legend (L3)
  EntityIcon.tsx                          + optional `color` prop
  NodeCard.tsx                            + hover affordance (prior pass)
  index.ts                                export GraphNode, GraphLegend
packages/graph/src/
  react-flow-adapter.tsx                  render GraphNode; derive hub; arrowheads
  GraphCanvas.tsx                         legend Panel; colorMode; per-side fit padding
```
Part C (shape = family channel):
```
packages/ui/src/components/nexus/
  GraphNode.tsx                           + NodeShape, shapeOf(); 4-shape badge (hex via SVG)
  ShapeIcon.tsx                           NEW — family silhouette for legend headers (L3)
  GraphLegend.tsx                         FAMILIES + shape; ShapeIcon in family headers
  index.ts                                export shapeOf, NodeShape, ShapeIcon
```

---

## 7. Open obligations

These are carried debt, not blockers — recorded so they aren't lost.

1. **Story + axe test + docs entry for the new primitives.** The working agreement
   (`CLAUDE.md` → *Working agreement*) requires these "whenever a primitive is added
   or changed." `GraphNode` and `GraphLegend` are new; `EntityIcon` changed. No
   `*.stories.tsx` exist in the repo yet. **This is the main debt this work order
   creates.**
2. **Entity-family → color sign-off** (tokens.css §header / discovery §9). The
   `--entity-*` palette is still marked PROVISIONAL. The redesign deliberately did
   **not** collapse or recolor it — that is a `/ds` decision requiring sign-off, not
   a silent edit.
3. **Detail-pane "todo"** (header copy: *"click again opens detail (todo)"*). Single
   click selects + populates the side pane; the second-click full detail page
   (discovery §2.1) is not yet wired.
4. **Aggregate "+N" nodes are unexercised** by the current seed (all 6 entities are
   singles). `GraphNode` supports the treatment; it needs a grouped fixture to
   verify visually.

### Recommended next step

`/qa audit page` — judge the redesigned surface (pip/label contrast on the dark
canvas, focus-visible on the collapse toggle and circular nodes) before adding the
stories/axe coverage in obligation 1.

---

## 8. Part C — Shape = family channel (Phase 2)

> **Status: APPLIED & verified 2026-06-04.** Source: `/redesign uplift` against
> `design-source/sketch` (CI-Library). Layered on top of Part B — adds a second
> encoding channel so **shape = family** is readable on the node itself, not just in
> the legend. Part B's channels (color = type, glyph, verdict pip, role) are
> unchanged.

### 8.1 Encoding model (the contract)

| Channel | Encodes | Mechanism |
|---|---|---|
| **Shape** | entity **family** | ● circle · ■ rounded square · ◆ diamond · ⬡ hexagon |
| **Color** | entity **type** | badge ring (neighbor) / fill (hub) via `--entity-*` |
| **Glyph** | type within family | `EntityIcon` |
| **Verdict** | severity (own channel) | pip on the badge via `--severity-*` |
| **Role** | hub vs neighbor | fill + larger size + ring (shape **NOT** overloaded) |
| **Group** | aggregate | `+N` count chip |
| **State** | selected / focused / hidden | accent ring · 50% opacity |

### 8.2 Shape → family map (in `shapeOf`)

- **● Circle** — threat principals: `actor`, `campaign`, `malware`
- **■ Rounded square** — infrastructure & artifacts: `ip`, `domain`, `hostname`, `url`, `hash`, `filename`
- **◆ Diamond** — detections & techniques: `exploit`, `sid`, `scan`
- **⬡ Hexagon** — messages & identities: `email_address`, `prs_message`

> The hub keeps its native family shape — focus is fill + size + ring, so
> "shape → family" has **zero exceptions**. This is what makes the legend trustworthy.

### 8.3 Apply checklist

**1. `packages/ui/src/components/nexus/GraphNode.tsx`**
- [x] `NodeShape` = `"circle" | "square" | "diamond" | "hexagon"`; extend `shapeOf` with the four cases above.
- [x] Branch hexagon to inline SVG (the border+ring trick renders rectangular for hex):
      `HEX_POINTS="27,5 73,5 96,50 73,95 27,95 4,50"`, fill = colorVar (hub) / surface-1, stroke = colorVar
      (none for hub), `strokeWidth=8`, `strokeLinejoin="round"`; extra `stroke=--nx-ring strokeWidth=16`
      halo polygon when `selected`. Keep the bordered-div path for circle / square / diamond.
- [x] Glyph centered; counter-rotate **only** for diamond. Keep `data-shape={shape}`.

**2. `packages/ui/src/components/nexus/ShapeIcon.tsx` (NEW)**
- [x] One SVG, `SHAPE_GEOMETRY` map (circle / square / diamond / hexagon), `stroke="currentColor"`,
      `fill="none"`, `strokeWidth=10`, `strokeLinejoin="round"`, `viewBox="0 0 100 100"`, default size 14.
- [x] NOTE: under React 18 + tsc, import `JSX` (`import type { JSX } from "react"`) or type the map
      as `Record<NodeShape, React.ReactElement>`.

**3. `packages/ui/src/components/nexus/GraphLegend.tsx`**
- [x] `FAMILIES` table (Threat ● / Infrastructure ■ / Detection ◆ / Messages ⬡).
- [x] Dynamic family groups: header = `<ShapeIcon shape={fam.shape}/>` (muted) + label;
      rows = `<EntityIcon type={t}/>` + `ENTITY_META[t].label`, filtered to `types` present.
- [x] Append the role/state key (filled = focus, outline = neighbor, +N = grouped) and verdict key
      (present severities as `--severity-*` pips — same element as the node pip).

**4. `packages/ui/src/components/nexus/index.ts`**
- [x] Export `GraphNode`, `shapeOf`, `NodeShape`, `GraphNodeProps`, `ShapeIcon`, `GraphLegend`.

**5. Verify only (already wired in Part B)**
- [x] `react-flow-adapter.tsx` → `GraphNode` with `hub` (densest degree) + centered hidden handles.
- [x] `GraphCanvas.tsx` → dynamic `{types, verdicts}` + `<Panel position="top-left"><GraphLegend/></Panel>`.

> **Reconciliation with §3.3:** the current `GraphLegend` already renders families as
> groups — Part C swaps the family header's color swatch for a `<ShapeIcon>` and adds
> the `shape` field to `FAMILIES`. The collapsible behavior and `fitView` per-side
> padding from Part B carry over unchanged.

### 8.4 Verification (Phase 2)

1. `pnpm turbo run typecheck --filter=@nexus/ui --filter=@nexus/graph --filter=@nexus/web`
   — watch the `JSX.Element` import in `ShapeIcon` (React 18 gotcha).
2. Reload preview + screenshot. Expect: filled-circle hub, ringed-circle threats, square
   infra/artifacts, diamond detections, hexagon messages; verdict pips on every non-aggregate;
   legend decoding shape → family, color → type, verdict pips.
3. Click a node → selection ring follows each shape (incl. the hex halo).

**Result (2026-06-04):** typecheck ✅ 3/3 (ui·graph·web), graph tests ✅ 4/4. In-browser:
`data-shape` confirms `shapeOf` mapping (hash→square·hub, campaign/actor/malware→circle,
ip/domain→square); hub renders as a **filled square** (family shape kept, role = fill+size);
verdict pips intact; legend headers show the shape silhouettes (THREAT ○ / INFRASTRUCTURE ▢);
clicking `bad.domain.com` shows the **rounded-square** selection ring + detail pane.
**Not exercised on-canvas:** ◆ diamond (`exploit/sid/scan`) and ⬡ hexagon
(`email_address/prs_message`) — the 6-node seed contains no detection or message entities.
Both shape paths typecheck and the legend adds them dynamically when such entities appear;
they remain visually unconfirmed until a fixture includes them (see §7.4-adjacent gap).

### 8.5 Decision log (Phase 2)

- **Shape ≠ role:** the hub keeps its family shape; focus = fill + size + ring. Diverges
  from the sketch (which made the hash-hub a circle) to keep the shape law
  exception-free. Latitude granted by stakeholder.
- **Hexagon for messages:** a 4th shape was added because email/message-centric
  investigations are a distinct mode worth a distinct silhouette (stakeholder confirmed).

### 8.6 Obligations carried by Part C

These **extend** §7 — they do not replace it.

- **Primitive contract (CLAUDE.md):** `GraphNode`, `ShapeIcon`, `GraphLegend` are new/changed
  DS components (and `EntityIcon` gained `color`) → each needs a Storybook story + axe test +
  docs entry. Still unwritten (compounds §7.1).
- **`--entity-*` palette stays PROVISIONAL** pending the family→color sign-off (§7.2). The shape
  channel now carries the family load, *reducing* color's burden — but the per-type hues still
  need locking. The shape channel does **not** substitute for that decision.
