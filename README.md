# Nexus Threat Explorer (NTX) — redesign

A domain-specific link-analysis tool for SOC analysts working Proofpoint TAP threat data.
Search an indicator → explore its threat graph → run transforms → inspect → act.

See [`docs/01-discovery-ia.md`](docs/01-discovery-ia.md) and [`docs/02-architecture-stack.md`](docs/02-architecture-stack.md).

## Live

- **Guides** (Docusaurus): https://snds.github.io/nexus/
- **Storybook** (component explorer + a11y addon): https://snds.github.io/nexus/storybook/
- **Threat Explorer demo**: https://snds.github.io/nexus/app/

All three deploy from `main` via GitHub Actions (`.github/workflows/deploy.yml`):
`apps/site` (Docusaurus prose guides), `@nexus/ui` Storybook (every `*.stories.tsx`), and
`apps/web` (the demo). The DS itself is shadcn/Radix-based: L1 base primitives in
`packages/ui/src/components/ui` (Button, Tooltip, Dialog, DropdownMenu, Popover) themed via
the token bridge, composed by L3 product wrappers in `components/nexus`.

## Layers (architecture §1)

| Layer | Package | Owns |
|---|---|---|
| L0 Tokens | `packages/tokens` | Dark-first appearance. Single source of truth. |
| L1 Base | `packages/ui/src/components/ui` | Pristine shadcn. **Never hand-edited.** |
| L2 Theme | `packages/tokens/*.css` | Appearance via the var bridge. |
| L3 Wrapper | `packages/ui/src/components/nexus` | Product primitives (`NodeCard`, `VerdictBadge`…). App + canvas import here. |
| L4 Visualization | `packages/graph` | Graph mechanics: model, layout, React Flow adapter. Renders L3 inside nodes. |
| L5 Domain | `packages/domain` | Entities, relationships, command registry, integration ports. Pure. |
| — Integrations | `packages/integrations` | Adapters implementing L5 ports (mock today; TAP/Splunk/PTR later). |

**The protected seam:** presentation (shared everywhere, incl. the canvas) vs. mechanics (owned by `graph`). Enforced by ESLint import boundaries in `eslint.config.js`.

## Stack
React 18 · TypeScript (strict) · Vite · Tailwind · shadcn (three-way contract) · React Flow + graphology · pnpm + Turborepo.

## Develop

```bash
pnpm install
pnpm dev         # runs the web app (apps/web) on :5173
pnpm typecheck
pnpm test
pnpm lint
```

## Status
Scaffold. End-to-end demo: seed graph renders with `NodeCard` inside React Flow nodes; click selects and surfaces Ops/Transforms/Actions from the domain registry; Expand grows the graph via the mock TAP port. See the docs' open questions before extending.
