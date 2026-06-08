# Design System Documentation Standard — v1.0 (2026-06-07)

The canonical information architecture, content model, and tooling split for **every** DS in
the portfolio (Nexus, Davinci, future rebuilds). Derived from an audit of mature systems.
This is the spec the docs tooling must satisfy — not a per-project negotiation.

---

## 1. Audit — what mature systems actually ship

| System | Top-level IA |
|---|---|
| **IBM Carbon** | Get started · **Foundations** (color, type, spacing, 2x grid, motion, icons, themes, tokens) · **Guidelines** (accessibility, content, focus, interactive states, color & contrast) · **Components** · **Patterns** · **Data viz** · Contributing · Migrating |
| **Atlassian** | Get started (about, install, designers/developers) · **Foundations** (accessibility, color, elevation, icons, illustrations, logos, spacing, grid, typography, interaction, motion) · **Components** · **Patterns** · **Content** (voice & tone, grammar, inclusive language, terminology) · **Tokens** · Resources |
| **Shopify Polaris** | **Foundations** (accessibility, IA, formatting) · **Design** (color, layout, typography, motion, space, icons, illustrations) · **Content** (voice & tone, grammar, product/UI copy) · **Patterns** · **Components** · **Tokens** · **Icons** |
| **Material 3** | Foundations · **Styles** (color, typography, elevation, icons, motion, shape) · **Components** · Develop |
| **Adobe Spectrum** | **Foundations** (principles, color, typography, layout, iconography, motion, voice & tone) · **Components** · **Patterns** · **Tokens** · Resources |
| **shadcn/ui** | Docs (install, theming, dark mode, CLI) · **Components** (per-component: preview + code + API) |

### Commonalities (the non-negotiable spine)

1. **Get started / Overview** — what it is, principles, dual audience (designer **and** developer paths), install, versioning, contribution, support.
2. **Foundations** — design principles, **accessibility**, color, typography, spacing, layout & grid, elevation/shadow, iconography, motion, shape/radius, **content/UX-writing & voice**, internationalization.
3. **Tokens** — the reference (actual values), tier model (global→semantic→component), theming/modes, naming.
4. **Components** — one page **per component** (not a gallery), to a fixed template (below). Interactive examples.
5. **Patterns** — composed solutions (forms, empty/error states, page layouts, navigation, data display).
6. **Content** — voice & tone, grammar/mechanics, terminology, inclusive language.
7. **Resources / Contributing** — Figma kit, code packages, contribution guide, **changelog/releases**, roadmap, support.

### Cross-cutting expectations
- **Dual audience** (design + code on the same page; toggle/tabs).
- **Maturity/status labels** per component (stable / beta / deprecated).
- **Versioning + changelog**; **search**; **live interactive examples**; **accessibility called out per component**.

---

## 2. Canonical IA (the standard for our systems)

```
Home / Overview
Get started
  ├─ For designers (Figma kit, libraries)
  ├─ For developers (install, usage, framework)
  ├─ Versioning & releases (changelog)
  └─ Contributing & support
Foundations
  ├─ Principles
  ├─ Accessibility            ← first-class section, not a footnote
  ├─ Color
  ├─ Typography
  ├─ Spacing & layout (grid)
  ├─ Elevation & surface
  ├─ Iconography
  ├─ Motion
  ├─ Shape & radius
  └─ Content & voice (UX writing)
Tokens
  ├─ Token model (tiers, naming)
  ├─ Primitives (full ramps + type scale)   ← raw scales, not just in-use
  ├─ Semantics (aliases)
  └─ Theming & modes (light/dark)
Components   (one page each, fixed template)
  grouped by category: Actions · Inputs · Navigation · Feedback · Layout · Data display · Domain (graph)
Patterns
Content guidelines
Resources / Contributing / Changelog
```

---

## 3. Component page template (the contract)

Every component page MUST contain, in order:

1. **Header** — name, one-line purpose, **status badge** (stable/beta/deprecated), links (Storybook, Figma, source).
2. **Live preview** — the real component (default), embedded; "Open in Storybook" for the full playground.
3. **Usage** — when to use / when *not* to; the closest alternatives.
4. **Anatomy** — labeled diagram of the parts.
5. **Variants & options** — every variant rendered.
6. **States** — default / hover / focus / active / disabled / loading / error as applicable.
7. **Sizing & responsiveness** (where relevant).
8. **Behavior & interaction** — keyboard, pointer, focus order.
9. **Content guidelines** — labels, casing, length.
10. **Accessibility** — roles/ARIA, keyboard map, contrast, known SC coverage.
11. **API** — props table (name, type, default, description) for code; properties for Figma.
12. **Code examples** — copy-paste, token-driven.
13. **Related** — sibling components / patterns.
14. **Changelog** — per-component change notes.

---

## 4. Tooling split (Docusaurus + Storybook, integrated)

The two surfaces are complementary, not redundant. Both **dogfood** the DS (chrome built from DS tokens + components).

| Concern | Docusaurus (the docs site) | Storybook (the workbench) |
|---|---|---|
| Overview / Get started / Foundations / Tokens / Patterns / Content / Contributing / Changelog | **Owns** (prose + live examples) | — |
| Per-component **prose** (usage, anatomy, a11y, do/don't, content) | **Owns** | — |
| Per-component **interactive playground** (controls/args, every variant & state, autodocs prop tables) | embeds preview + deep-links | **Owns** |
| Accessibility checks per story | links | **Owns** (addon-a11y) |

Integration: each Docusaurus component page embeds the default story and deep-links to the
matching Storybook story (`?path=/story/...`). Storybook uses `tags: ['autodocs']` so prop
tables + docs pages are generated from the component types.

---

## 5. Nexus — gap analysis (current vs canonical)

| Area | Status |
|---|---|
| Overview | ✅ exists |
| Get started (install/usage, designers vs devs) | ❌ missing |
| Versioning / **Changelog** / releases | ❌ missing |
| Foundations: color, type, motion, radius | ✅ (foundations page) |
| Foundations: **Accessibility** (dedicated) | ❌ missing |
| Foundations: spacing & layout, elevation, iconography (as foundation), shape | ⚠️ partial / implicit |
| Foundations: **Content & voice** | ❌ missing |
| **Tokens** section (model + primitives + semantics + theming) | ⚠️ on foundations page; no dedicated Tokens area or theming page |
| **Components: per-component pages** (template above) | ❌ only a single gallery page |
| Component **status/maturity** labels | ❌ missing |
| **Patterns** | ❌ missing |
| **Content guidelines** | ❌ missing |
| Resources (Figma, packages) / Contributing | ⚠️ Contributing exists; no resources/Figma |
| Storybook **autodocs / prop tables / controls** | ❌ stories lack autodocs + args controls |
| Search | ⚠️ Docusaurus default (no Algolia) |

**Verdict:** the chrome is dogfooded and foundations are strong, but the IA is ~40% of the
canonical model. The biggest gaps: per-component documentation, a dedicated Tokens area,
Patterns, Content, Accessibility, Get-started, and Changelog — plus Storybook autodocs.

---

## 6. Refactor plan (Nexus, then Davinci — same standard)

Phased so each phase ships independently and stays green.

**Phase 1 — Storybook becomes the component source of truth.**
Add `tags: ['autodocs']` + `argTypes`/controls to every story; organize the sidebar to the
canonical categories (Foundations · Tokens · Components/<category> · Patterns). Autodocs gives
prop tables for free → Docusaurus can deep-link instead of duplicating APIs.

**Phase 2 — Docusaurus IA scaffold.**
Restructure the sidebar to the canonical tree (Get started · Foundations · Tokens · Components
· Patterns · Content · Resources · Changelog). Add section landing pages.

**Phase 3 — Per-component pages.**
A reusable MDX template (header+status, embedded live preview, usage, anatomy, variants,
states, a11y, props, examples, related, changelog) + a small `<ComponentMeta>` / `<Embed>`
doc component. Author one page per primitive (Button, Text, Tooltip, Dialog, DropdownMenu,
Popover, Icon, Pill, VerdictBadge, StatCircle, Stepper, StateBlock, ToolButton, NodeBadge,
GraphLegend). Status labels + Storybook/Figma/source links.

**Phase 4 — Foundations completion + Tokens area.**
Add Accessibility, Spacing & layout, Elevation, Iconography, Shape, Content & voice. Split
Tokens into its own area (model · primitives · semantics · theming/modes).

**Phase 5 — Patterns + Content + Resources + Changelog.**
Patterns (graph canvas, forms, empty/error/loading, page layouts). Content guidelines.
Resources (Figma kit placeholder, packages, contribution). Changelog (from git/releases).

**Phase 6 — Polish.** Search (Algolia or local), per-component changelogs, maturity dashboard.

**Davinci:** identical standard + tooling split. The MDX template, doc components, Storybook
autodocs config, and IA tree are portable — lift them across once proven on Nexus. (Davinci is
a separate repo; apply there when pointed at it.)

---

## 7. Definition of done
- Docs IA matches §2; every component has a page matching §3.
- Tokens area documents primitives + semantics + theming.
- Storybook autodocs on every component; sidebar categorized.
- Accessibility + Content sections present; Changelog live.
- Both surfaces dogfood the DS chrome. CI gate stays green.
