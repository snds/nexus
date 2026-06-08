# NTX Redesign — Architecture & Stack Proposal

**Companion to:** `01-discovery-ia.md`
**Date:** 2026-06-04
**Status:** Proposal — **core decisions LOCKED 2026-06-04** (see box below). Remaining open questions in discovery §9.

> ### ✅ Decisions locked (2026-06-04)
> 1. **Graph engine: React Flow (`@xyflow/react`) + graphology model + elkjs/d3-force layout.** Confirmed.
> 2. **Scale target: hundreds → low thousands of nodes post-aggregation.** React Flow's sweet spot; aggregation ("+N") is the density strategy, not raw scale.
> 3. **Node color = entity type (keep the legacy taxonomy).** Severity/verdict moves to a *separate* visual channel (ring/badge), NOT color. See §5.

> **Guiding principle (inherited from Davinci's mantra, adapted):** *Separation of concerns is the default.* Every change lands in the layer that owns it. But your explicit NTX constraint refines it: **shared design-system components are used everywhere, including inside the node canvas.** So the seam we protect is **presentation (shared primitives) vs. mechanics (graph topology, layout, data)** — *not* "design system vs. graph." The graph is not walled off; it *consumes* the system.

---

## 1. The layering model for NTX

Six layers. The first four are the Davinci three-way contract, carried over for the shell and all DS primitives. The last two are new and specific to a link-analysis product.

```
┌─────────────────────────────────────────────────────────────────┐
│ L0  TOKENS            packages/tokens                              │
│     Dark-first. Light + Dark both first-class (exist in source).  │
│     Single source of truth for color/space/radius/type/severity.  │
├─────────────────────────────────────────────────────────────────┤
│ L1  BASE              packages/ui/src/components/ui   (shadcn)     │
│     Pristine, regenerable. NEVER hand-edited. Upstream a11y.      │
├─────────────────────────────────────────────────────────────────┤
│ L2  THEME             tokens/shadcn-bridge.css + nexus.css         │
│     All appearance via the var bridge + [data-slot] selectors.    │
├─────────────────────────────────────────────────────────────────┤
│ L3  WRAPPER / NATIVE  packages/ui/src/components/nexus             │
│     Product primitives: Node card, EntityBadge, VerdictBadge,     │
│     SeverityRing, Hovercard, DataTable, ContextMenu, DetailPane.  │
│     Additive. Composes L1. App + canvas import from HERE.         │
├═════════════════════════════════════════════════════════════════┤
│ L4  VISUALIZATION     packages/graph                               │
│     GRAPH MECHANICS ONLY: in-memory model, layout, renderer       │
│     adapter, selection/op engine. Renders L3 components as nodes. │
│     Owns topology. Knows NOTHING about TAP/Splunk specifics.      │
├─────────────────────────────────────────────────────────────────┤
│ L5  DOMAIN + PORTS    packages/domain                              │
│     Entity vocabulary, relationship model, Transform Registry     │
│     (Ops/Transforms/Actions), integration PORTS (TAP/Splunk/PTR). │
└─────────────────────────────────────────────────────────────────┘
```

**The two new seams, stated as hard rules:**

- **L4 ⟂ L3 (mechanics vs. presentation):** the graph package owns *where a node is, how edges route, what's selected, how groups aggregate*. It owns **zero pixels of node chrome** — a node's visual is an L3 `<NodeCard>` rendered into the canvas. Swapping the node's look never touches L4; changing layout never touches L3.
- **L4/L5 ⟂ integrations (domain vs. vendor):** the canvas and domain talk to **ports** (`ThreatDataPort`, `SplunkPort`, `RemediationPort`). TAP/Splunk/PTR are **adapters** behind those ports. The graph never imports a vendor SDK. This is what lets NTX track upstream TAP changes without rework — the same instinct that keeps the shadcn base pristine.

---

## 2. Stack (recommended)

| Concern | Choice | Why |
|---|---|---|
| Language | **TypeScript (strict)** | A typed domain (closed entity vocabulary, transform registry) is the backbone; types are load-bearing here. |
| Build / app | **Vite + React 18** | Fast, matches the shadcn/Davinci toolchain. |
| Component base | **shadcn/ui** (three-way contract) | Carries over Davinci's pristine-base discipline + CI regen-diff guard. |
| Styling | **Tailwind + token bridge** | Same theme mechanism as Davinci; dark-first. |
| **Graph canvas** | **`@xyflow/react` (React Flow)** + **graphology** model + **elkjs/d3-force** layout | See §3 — the decisive choice. React nodes = shared DS components inside the canvas (your constraint), with the data model decoupled so the renderer is swappable. |
| Data tables | **TanStack Table + TanStack Virtual** | Detail panes are table-heavy (Forensics, Linked-X, Settings). Composes DS primitives (unlike AG Grid's black box), virtualizes for big forensic tables. |
| Server state | **TanStack Query** | Per-node/per-table async with isolated loading/error/refetch — directly serves the source's per-node failure isolation. |
| Canvas UI state | **Zustand** | Selection set, hidden/grouped state, viewport, focus — local, high-frequency, not server state. |
| Routing | **TanStack Router** or React Router | Dashboard / Search / Graph / Detail / Settings surfaces. |
| Testing | **Vitest + Testing Library + Playwright + axe** | Per home `~/CLAUDE.md`: story + axe test + docs per primitive. |
| Docs | **Storybook** | Same as Davinci; node states + transforms are highly story-able. |
| Monorepo | **pnpm workspaces + Turborepo** | Matches Davinci; clean package seams. |

---

## 3. THE decision — graph rendering engine

This is the make-or-break technical bet. The candidates, scored against NTX's actual requirements:

| Requirement (from discovery) | React Flow | Cytoscape.js | Sigma.js / graphology | Custom WebGL |
|---|---|---|---|---|
| **DS components inside nodes** (your hard constraint) | ✅ nodes *are* React components | ❌ canvas-drawn | ❌ WebGL-drawn | ❌ |
| Marquee select, multi-select, pan/zoom | ✅ built-in | ✅ | ⚠️ partial | build it |
| Grouping / aggregate (+N) nodes | ✅ subflows/parent nodes | ✅ compound nodes | ⚠️ manual | build it |
| Per-node async load + error states | ✅ trivial (it's a component) | ⚠️ awkward | ⚠️ awkward | build it |
| Force / hierarchical layout | ➕ via elkjs/d3-force | ✅ native | ✅ native | build it |
| Scale to 10k+ raw nodes | ⚠️ ~1–2k comfortable | ✅ thousands | ✅ 10k+ | ✅ |
| Save/restore full graph state | ✅ serializable | ✅ | ✅ (graphology) | build it |

**Recommendation: React Flow (`@xyflow/react`) for rendering, with `graphology` as the engine-independent in-memory graph model, and `elkjs` (hierarchical) + `d3-force` (organic) for layout.**

**Why this wins for *this* product:**
1. **Your constraint is decisive.** "Shared DS components even inside the node tool" is only natural in React Flow, where every node is a React component that composes L3 `<NodeCard>`, `<VerdictBadge>`, `<Hovercard>`, etc. Cytoscape/Sigma draw to canvas/WebGL and *cannot* host React DS components inside nodes without fighting the grain. Choosing them would violate the one architectural rule you set.
2. **The product never renders 10k raw nodes.** The legacy design's **aggregate "+N" nodes are a deliberate density-management strategy** — investigations expand a pivot, pull a few hundred neighbors, then *group/collapse* to stay legible. React Flow's comfortable range (hundreds → low thousands) matches how analysts actually work. We design *with* aggregation, not against scale.
3. **Per-node resilience falls out for free.** The source's per-node loaders and "node expand load failure" are trivial when a node is a component with its own Suspense/error boundary + TanStack Query.

**De-risking the one weakness (scale):** because the **data model is `graphology`, decoupled from the renderer**, the renderer is swappable. If real-world graphs blow past React Flow's comfort zone, we keep L5 domain + the graphology model and swap *only* the L4 renderer adapter to sigma.js/WebGL — losing in-node React components only for the extreme-scale view (an acceptable, isolated trade). This decoupling is the separation-of-concerns mantra doing real work.

> **Resolved (2026-06-04):** target is **hundreds → low thousands of nodes post-aggregation** — squarely React Flow's comfort zone. The graphology decoupling stays anyway as cheap insurance, but no WebGL renderer is planned.

---

## 4. The domain layer (L5) — typed vocabulary + transform registry

The closed entity vocabulary and the three command classes become **data, not hardcoded UI.**

```ts
// Entity vocabulary — closed union from discovery §2
type EntityType =
  | 'actor' | 'campaign' | 'malware' | 'exploit' | 'sid'
  | 'hash' | 'url' | 'domain' | 'ip'
  | 'hostname' | 'filename' | 'email_address' | 'prs_message' | 'scan';

interface Entity {
  id: string;
  type: EntityType;
  label: string;
  verdict: Verdict;          // drives the severity ring (see §5)
  score?: number;            // 0–100
  firstSeen?: string; lastSeen?: string;
  attrs: Record<string, unknown>;   // type-specific body
}

// Edge = "observed associated with"; heterogeneous multigraph
interface Relationship { source: string; target: string; kind: string; }

// The command taxonomy from discovery §4.3 — a REGISTRY, so transforms grow without UI changes
type CommandClass = 'op' | 'transform' | 'action';
interface GraphCommand {
  id: string;                       // 'expand', 'show-attacker-infra', 'add-to-ptr'
  class: CommandClass;
  label: string;
  appliesTo(selection: Entity[]): boolean;   // enable/disable logic from the annotations
  run(ctx: GraphContext): Promise<GraphMutation>;
  shortcut?: string;                // 'e', 'cmd+g', …
  port?: 'splunk' | 'ptr' | 'tap';  // which integration it needs
}
```

This makes the context menu (Ops/Transforms/Actions), toolbar, and keyboard map **one source of truth**, and answers Open-Q §9.4: transforms become a registry that can be extended (admin- or data-driven) without touching the canvas.

---

## 5. Node visual language — channel assignment (LOCKED: color = entity type)

Decision: **node color stays as the entity-type encoding** (the legacy 6-color taxonomy is kept). The previously-overloaded "color = severity" reading is removed — **severity gets its own channel.** Each axis now maps to exactly one independent channel:

| Channel | Encodes | Notes |
|---|---|---|
| **Color** | **Entity type / type-family** | Keep legacy `Node/{Black,Blue,Green,Dark Green,Red,Gray}`. 6 colors ≈ entity *families* (e.g. infrastructure / threat / actor / message / detection); the per-type **glyph** disambiguates within a family. Defined as `--entity-{type}` tokens. |
| **Glyph / icon** | Specific entity type | One icon per `EntityType` (actor, campaign, hash, url, ip, sid, …) layered on the colored body. |
| **Severity ring / badge** | Verdict | NEW dedicated channel: `malicious \| phishing \| suspicious \| medium \| benign \| unknown` → `--severity-*` token ramp. Never reuses entity color. |
| **Selection** | In current selection set | Ring / elevation. |
| **Focus** | The focused node | Distinct focus ring (⌘F recenters on it). |
| **Hidden** | Hidden state | 50% opacity (per source spec). |
| **Aggregate** | Grouped "+N" node | Stacked treatment + "+N" count badge. |

> **Mapping task before building nodes:** confirm which `EntityType`s map to each of the 6 legacy colors (the source uses 6 colors for 14 types, so colors group *families*). I'll propose a family→color map from the symbol set when we build the L3 node primitive, for your sign-off. Everything is `--entity-*` / `--severity-*` token-driven, so a policy change is one token edit, never a component edit.

---

## 6. Proposed monorepo structure

```
nexus/
├── apps/
│   └── web/                    # the NTX app (Vite + React)
├── packages/
│   ├── tokens/                 # L0 — dark-first design tokens + shadcn bridge
│   ├── ui/
│   │   ├── src/components/ui/     # L1 base (pristine shadcn, regenerable)
│   │   └── src/components/nexus/  # L3 wrapper/native primitives
│   ├── graph/                  # L4 — graphology model + React Flow adapter + layout + op engine
│   ├── domain/                 # L5 — entities, relationships, transform registry, ports
│   └── integrations/           # adapters: tap/, splunk/, ptr/ (implement L5 ports)
├── docs/                       # this folder
└── .shadcn-registry.json       # regen-diff guard (carried from Davinci)
```

**Import rules (enforced via eslint boundaries):**
- `apps/web` → may import `ui/nexus`, `graph`, `domain`. **Never** `ui/ui` (base) directly.
- `graph` → may import `ui/nexus`, `domain`. **Never** `integrations` directly (talks via `domain` ports).
- `domain` → pure. No React, no vendor SDKs.
- `integrations` → implements `domain` ports; the *only* place vendor SDKs live.

---

## 7. Carry-over from Davinci (keep) + what's new (add)

**Keep:** three-way contract (L1–L3), tokens-as-truth, `.shadcn-registry.json` regen-diff CI guard, story + axe test + docs per primitive, small focused diffs.

**Add for NTX:**
- **L4 graph package** with the model⟂renderer split.
- **L5 domain + ports** with the transform registry.
- **`integrations/` adapter packages** behind ports.
- **Dark-first** token defaults (Davinci was light-first).
- **eslint import-boundary rules** to enforce the new seams (the CI equivalent of the regen-diff guard, but for layer crossing).
- **A serious DataTable primitive** as tier-1 (forensic + linked-entity tables are core, not incidental).

---

## 8. Risks & mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Graph scale exceeds React Flow comfort | High | graphology model decoupled → swap renderer to sigma/WebGL without touching domain. Confirm real node counts (Open-Q). |
| Node-color decode wrong (§5) | High | Validate the type-vs-severity split with you before building the node system. It's the most expensive thing to get wrong. |
| Transform catalog larger/more dynamic than seen | Med | Registry is data-driven from day one; new transforms = data, not code. |
| TAP/Splunk/PTR API specifics leak into UI | Med | Ports + adapters; eslint boundary forbids vendor imports outside `integrations/`. |
| Forensic tables huge (13M IDS events seen) | Med | Server-side pagination behind TanStack Query + virtualized TanStack Table; never load full sets. |
| Dark/light parity drift | Low | Both are token-defined; visual regression stories in both themes. |

---

## 9. Recommended sequencing (proposal, not committed)

1. **Confirm the open questions** (discovery §9) — especially node-color semantics + scale targets.
2. **Scaffold the monorepo** + tokens (dark-first) + carry over the shadcn contract & CI guard.
3. **Domain layer first** (`packages/domain`): entity types, relationship model, transform registry skeleton, ports. Pure, testable, no UI.
4. **L3 node-system primitives** (`NodeCard`, `VerdictBadge`/`SeverityRing`, `EntityBadge`, `Hovercard`) in Storybook — prove the visual language in isolation.
5. **L4 graph spike**: graphology + React Flow rendering L3 nodes, with expand/group/select + one real layout. **De-risk the central bet early** on realistic data volume.
6. **Detail pane + DataTable**, wired to TanStack Query (per-node/table resilience).
7. **One end-to-end journey** (J1 Search→Graph) before breadth.
8. Then breadth: remaining journeys, integrations, settings, system states.

---

## 10. Status — cleared to scaffold

The gating decisions are made (engine, scale, color channel — see the locked box up top). **Architecture is ready to build against.** Remaining inputs are non-blocking and can be resolved as we go (discovery §9): verdict scale exact values, Reports scope, transform catalog dynamism, real-time vs. snapshot, the RBAC role matrix, and the entity-family→color map (which I'll propose when we build the L3 node primitive). Next step is sequencing item 2: scaffold the monorepo + dark-first tokens + the carried-over shadcn contract.
