# NTX Redesign — Discovery & Information Architecture

**Product:** Proofpoint Nexus Threat Explorer (NTX), the visual link-analysis surface over Targeted Attack Protection (TAP).
**Author:** reconstructed from the legacy Sketch source (`CI-Library File.sketch`, Sketch 2026.1.2) — 24 pages, 9 entity detail screens, 291 library symbols, 3 fully storyboarded use-cases, and the Search→Graph master flow.
**Date:** 2026-06-04
**Status:** Discovery draft for review. **Inferences are flagged `⊳ INFERRED`** — everything else is taken directly from the source file's layer names, text content, and annotations.

> **How to read this doc.** Source had no written documentation. Everything here is reverse-engineered from artboard/layer naming, on-canvas annotation text the original designer left in the file, and the storyboarded step sequences. Where the file *told me* (annotations, copy, explicit step numbers) I state it plainly. Where I'm reconstructing intent, I flag it. Correct any `⊳ INFERRED` line and it propagates into the architecture doc.

---

## 1. Product thesis (one paragraph)

NTX is a **domain-specific link-analysis tool** — same genre as Maltego, Linkurious, or Cytoscape-based investigation tools — purpose-built for SOC analysts working Proofpoint TAP threat data. An analyst **searches** for a threat indicator (a hash, URL, IP, campaign, actor…), gets a **node graph** of that indicator and its neighbors, and then **explores outward** by running graph operations (expand/group/hide) and **transforms** (semantic queries like "Show Attacker Infrastructure"), inspecting any node's full **detail pane**, and finally **acting** (export, enrich, push to Proofpoint Threat Response, query Splunk). The whole investigation can be **saved as a graph** and returned to. The job is *trace → identify → remediate → monitor* on live threats in the customer's environment.

The single most important architectural fact: **this is not a dashboard with a chart in it. The graph canvas is the application.** Everything else (search, detail panes, dashboard, settings) is scaffolding around the canvas.

---

## 2. Domain model — entities

NTX has a closed vocabulary of **node/entity types**. These are confirmed by (a) the `Type` field on detail pages, (b) the neighbor-expansion "By type…" menu, (c) the dedicated detail screen per type, and (d) the `Icon/Threat/*` and `Node/…` symbol families.

### 2.1 Primary entity types (each has a dedicated detail screen)

| Entity | Internal id | What it is | Has detail page |
|---|---|---|---|
| **Actor** | `actor` | Threat actor / group (e.g. `TA505`, `TA511`, `TA524`, `TA234`, `TA643`) | ✅ Actor Detail |
| **Campaign** | `campaign` | A named attack campaign (e.g. *"The Trick 'mac1' — MS Excel docs embedded in PDFs"*, *"Zloader Botnet 18 (US Targeting)"*) | ✅ Campaign Detail |
| **Malware** | `malware` | Malware family (e.g. *Loki*, *The Trick*, *Tordal*, *Pony*, *Zloader*) | ✅ Malware Detail |
| **Exploit** | `exploit` | Exploitation technique (e.g. *Office VBA Macro*, *Packager Shell Object*) | ✅ Exploit Detail |
| **Signature ID (SID)** | `sid` | IDS/IPS detection signature (e.g. `2815266`) with categories, severity, affected products | ✅ Signature ID Detail |
| **File Hash** | `hash` | SHA256 file hash (the canonical malicious-file identifier) | ✅ Detail View — Hash |
| **URL** | `url` | Malicious URL | ✅ URL Detail |
| **Domain** | `domain` | Malicious domain (e.g. `bad.domain.com`) | ✅ Domain Detail |
| **IP Address** | `ip` | Malicious IP (with ASN info, e.g. `204.11.56.48`) | ✅ IP Address Detail |

### 2.2 Secondary / supporting entity types (appear in the graph, no standalone detail page in source)

| Entity | Internal id | Notes |
|---|---|---|
| **Hostname** | `hostname` | Distinct from Domain in the data model (e.g. `hostname1.com`) |
| **Filename** | `filename` | e.g. `//filename.exe`, `filename.doc` |
| **Email Address** | `email_address` | Generic; and a specialized **Recipient Email Address** (the *targeted user*, e.g. `rcastle@acme.com`) |
| **Email Message / PRS Message** | `prs_message` | A specific delivered message; PRS = Proofpoint message store ⊳ INFERRED |
| **Scan** | `scan` | A sandbox detonation/scan result |
| **IOC** | — | Indicator of Compromise — used as a *role/tag* (`Sender, IOC, ET IP`) rather than a node type per se ⊳ INFERRED |
| **Sender** | — | A role on an IP/email (`Source: Sender, IOC`) |

> ⊳ **INFERRED — model nuance:** "Hostname vs Domain" and "Email Address vs Recipient Email Address" being separate types tells me the data model distinguishes *infrastructure observed* from *role in this attack*. The redesign should preserve that — collapsing them would lose investigative meaning.

### 2.3 Entity detail-pane anatomy (shared shell, per-type body)

Every detail pane follows one template. **The header is identical across types; the body sections vary by type.**

**Shared header:** entity Type + icon · primary identifier · verdict badge (*Malicious / Phishing / Medium / Suspicious* ⊳) · "*N Users — At Risk*" impact chip · `First Seen On` / `Last Seen On` · **View Full Details** · **View in TAP** · **Graph View** (re-pivot into graph).

**Body sections observed (union across types):**
- **Summary** — narrative description ("View description" expander).
- **Linked <entities>** — counts + drill tables for every *other* entity type it connects to: Linked File Hashes, Linked URLs, Linked IP Addresses, Linked Domains, Linked Campaigns, Linked Malware, Linked Signature IDs, Linked Actors. **This is the relationship graph rendered as tables** — the tabular twin of the node graph.
- **Categories & Scores** — `Email` / `Network` reputation scores, `Score`, `Policy`, `Category` (e.g. `Malware_CnC`, `Spyware CnC`, `Fake AV`, `P2P`, `EXE_Source`, `Proxy`).
- **Forensics** (for hashes/malware/scans) — tabbed: **DNS Activity · Connections · HTTP Requests · Process Activity · File Activity · Registry Activity · Mutex · Sandbox Detections · VirusTotal Results**. Includes human-readable behaviors ("Impersonated a Windows system process", "Modified the Windows Registry to enable auto-start", "Injected code into another process").
- **File metadata** (hash/malware) — `File Type` (PE, Office), `File Names`, `File Size`, `SHA256 Hash`.
- **Type-specific:**
  - *SID:* Categories, Severity (Major/Minor ⊳), Affected Products, Attack Target (`Client_Endpoint`, `WEB_CLIENT`), `Number of IDS Events` (e.g. 13,095,986), `Number of SID Matches`, Creation/Last-Modified dates.
  - *IP:* `View ASN Information`, Source role (Sender / IOC / ET IP), Both (inbound/outbound ⊳).
  - *Campaign:* Actor(s), Exploit(s), Classification, Delivery Mechanism, Attachment.
- **Per-context drawer updates** (page *"Q2 - Detail Pane Context Updates"*): specialized panes for **SHA256 Hash**, **SHA256 Hash Group**, **Email Address / Email Address Group**, **Email Message / Email Message Group**, **IP Address**, **Scan** — i.e. **single vs. group (aggregate) nodes get different panes.**

### 2.4 Relationships

The graph is a **heterogeneous multigraph**: any entity can link to any other, and the edge *means* "observed associated with." The detail-pane "Linked X" counts are the same adjacency the canvas draws as edges. Canonical relationship chains seen in the flows:

```
Actor ─runs→ Campaign ─delivers→ Malware ─uses→ Exploit
Campaign ─targets→ Recipient Email Address (the compromised user)
Malware/Hash ─contacts→ Domain / Hostname / IP / URL   (attacker infrastructure / C2)
Hash ─detected-by→ SID
Message ─carries→ Hash / URL ; ─sent-from→ Sender IP
```

---

## 3. The node visual language (decode of the `Node/*` symbol family)

The legacy node system encodes meaning on **five simultaneous axes**. This is the richest and most fragile part of the existing design — and the part most worth rationalizing in the redesign.

| Axis | Values in source | Encodes (⊳ INFERRED meaning) |
|---|---|---|
| **Structure** | `Single` · `Group` · `Focused` | Single node vs. aggregate/grouped node vs. the one currently-focused node |
| **Color** | `Black` · `Blue` · `Green` · `Dark Green` · `Red` · `Gray` | Severity/verdict **or** entity-category. **Needs decoding (see below).** |
| **Selection** | `Selected` · `Unselected` | Click state |
| **Stroke** | `Stroke` · `No Stroke` | Emphasis / ring — likely "is in current selection set" vs. focus ring ⊳ |
| **Size** | `Small` · `Normal` | Zoom/aggregate-weight driven ⊳ |
| **Label** | `Left-to-Right` · `Right-to-Left` + color | Label anchors on the side away from graph center to avoid overlap ⊳ |

There are also dedicated treatments for **VIP nodes** (`VIP-Icon`, "VIP Nodes Highlighting") and **SID nodes** ("SID Node Treatment"), plus per-node **loader states** (`Loader/Node/Individual|Grouped|Focused × Normal|Error`) — meaning **each node loads and can fail independently** (confirmed by the "Node expand load failure" artboard).

> ✅ **RESOLVED (2026-06-04): node color = entity type** (the legacy 6-color taxonomy is kept). The "color = severity" reading is rejected. Because there are 6 colors for ~14 types, **color encodes entity *families*** and the per-type **glyph** disambiguates within a family. **Severity/verdict moves to its own channel** (a dedicated ring/badge), never color. Channel assignment is specified in `02-architecture-stack.md §5`; the family→color map will be proposed when the L3 node primitive is built.

---

## 4. Graph interaction grammar (from the `Node Ops + Toolbar` annotations — these were written in the file)

The original designer left detailed interaction specs on-canvas. Captured verbatim-in-substance:

### 4.1 Selection model
- **Click** a node → selects it + shows the **toolbar**; does **not** open the detail pane.
- **Click again** → opens the **detail pane**; context menu vanishes.
- **Shift+click** → add to selection (multi-select per object).
- **Marquee drag** → rectangular select (includes partials).
- **Hold ⌘/Ctrl** → hidden nodes become temporarily visible (50% opacity).
- **⌘/Ctrl+Shift** → multi-select single nodes/groups.

### 4.2 Node operations — three access paths each (context menu · toolbar · keyboard)

| Op | Keyboard | Semantics |
|---|---|---|
| **Expand** | `e` | Toolbar/key = 1 edge only. Context menu = **1 edge / 2 edges / By type…** (pick neighbor types) |
| **Collapse** | `⌘/Ctrl+E` | Collapses *all* neighbors back to the selected node, regardless of prior expansion |
| **Group** | `g` | Combines *like* types; mixed selections group per-type. Aggregate + non-aggregate can co-group |
| **Ungroup** | `⌘/Ctrl+G` | Aggregate nodes **cannot** be ungrouped (but can expand/collapse/hide/unhide) |
| **Hide** | `h` | Hidden nodes → 50% opacity; only available action is Unhide |
| **Unhide** | `⌘/Ctrl+H` | Only on selected hidden node; toolbar icon disabled until a hidden node is selected |
| **Reset Graph** | `⌘/Ctrl+R` | Reverts to original state before any operations |
| **Save Graph** | `⌘/Ctrl+S` | Triggers save dialog flow |
| **Deselect all** | `⌘/Ctrl+Shift+A` | |
| **Zoom in/out** | `⌘/Ctrl + +/−` | ~20% increments |
| **Focus/recenter** | `⌘/Ctrl+F` | Recenter view on focused node |

**Aggregate ("+N") nodes:** labels show a count with `+` to signal a data range (e.g. `10+`, `20+`, `30+`). The label reflects combined data visibility of grouped nodes.

### 4.3 Context-menu command classes (the key structural insight)

The right-click / context menu is organized into **three command classes** — this is the spine of the whole interaction model and should be preserved as an explicit taxonomy:

1. **Node Ops** — pure topology: Expand, Collapse, Group, Ungroup, Hide, Unhide, Pin, Reset Graph.
2. **Transforms** — *semantic graph queries* that fetch & add new related nodes:
   - "Show related compromise indicators"
   - "Show Attacker Infrastructure"
   - "Check for clicks by users (Splunk Query)"
   - "Check for anonymous login activity"
   - (these are the Maltego-style "transforms" — domain logic, not topology)
3. **Actions / Enrich** — push data outward or pull enrichment:
   - **Enrich** (threat-intel lookup, `threat_intel`)
   - **Export as CSV**
   - **Query Splunk…**
   - **Add to PTR** (Proofpoint Threat Response — remediation hand-off)
   - **View in TAP** / **View Full Details**

> This three-class taxonomy (Ops / Transforms / Actions) is the backbone for both the redesigned context menu **and** the eventual plugin/extensibility model. Transforms especially are data-driven and will grow over time.

### 4.4 Canvas chrome
- **Left rail nav** (icons): `dashboard`, `search`, `graph`, `reports`, `settings`, `feedback`, `help_center`, plus `targeted` (TAP cross-link) and `app_switcher`.
- **Graph toolbar:** zoom in/out, recenter, save, date-range, node-op buttons.
- **Neighbor Nodes panel:** lists expandable neighbors grouped by type with counts, "All neighbors" / "By type…", back navigation, "View Full Details" / "View in TAP".
- **Date selector:** Last 24 hours / Last week / Last month / Custom date… ("Showing last 7 days").
- **Detail pane / drawer:** slides in on second click; has its own load + error states.

---

## 5. Information architecture (top-level surfaces)

```
NTX
├── FTU / Welcome                      (first-time onboarding: 2 screens)
├── Dashboard                          ← home
│   ├── My Saved Graphs  (grid + list view)
│   ├── All Graphs
│   └── graph card actions: open / edit / delete / save
├── Search                             ← primary entry to an investigation
│   ├── Typeahead (with loading / null / network-fail states)
│   └── Results screen (entity results, "view all results")
├── Graph (the application)            ← the core surface
│   ├── Canvas (nodes, edges, groups, aggregates, VIP, focus)
│   ├── Toolbar + keyboard grammar
│   ├── Neighbor Nodes panel
│   ├── Detail pane / drawer (per-entity, single vs group)
│   ├── Date range control
│   ├── Save / Auto-save / Refresh flows
│   └── Context menu (Ops · Transforms · Actions)
├── Entity Detail pages (full-screen)  ← Actor, Campaign, Malware, Exploit,
│       SID, Hash, URL, Domain, IP     (deep dive outside the canvas)
├── Reports                            ⊳ INFERRED (nav icon present; no screens in source)
├── Settings / Preferences
│   ├── Privileges (roles/permissions)
│   ├── VIP settings (enable/disable VIP highlighting)
│   ├── Connected Apps (Splunk integration)
│   └── Revoke confirmation
├── Notifications                      (bell indicator on/off, panel)
├── Masquerade mode                    (SE/admin "view as customer" — saved graphs grid/list)
└── App Switcher                       (cross-Proofpoint product nav)
```

### Integrations (first-class, not afterthoughts)
- **TAP** — the data substrate. "View in TAP", TAP Pivots flow, TAP Update Notification, "TAP Users Flow."
- **Splunk** — deep two-way: admin setup (multi-step, with CORS/connection/login error handling), per-node "Query Splunk" transforms, graph-from-Splunk loader.
- **PTR (Proofpoint Threat Response)** — remediation target ("Add to PTR").

---

## 6. User journeys (reconstructed from the storyboarded flows)

The source contains four fully-stepped journeys. These are the **jobs to design for.**

### J1 — Search → Graph (the master flow, 10 graph steps + detail steps)
1. **Search** for an indicator (Step 1) → typeahead → results.
2. Select a result → **graph generates** centered on that node (Steps 2–3).
3. **Expand neighbors** by type/edge; graph grows (Steps 3a–7).
4. **Group / collapse** to manage density (Steps 7a–b).
5. **Select a node → open detail pane** (Steps 8, 8a "Categories & Scores", 9, 9a).
6. **Auto-save** kicks in ("We've auto-saved your most recent graph… we'll save the next 2 graphs… save permanently in your dashboard").
7. Optionally **Save Graph** permanently (name, visibility) or get the **"Hold up! save before you navigate away?"** guard.

### J2 — Related IOCs (7 steps)
Analyst starts from a known-bad **hash/URL**, runs the **"Show related compromise indicators"** transform to pull every associated IOC, groups by type, then **Exports as CSV** / **Adds to PTR** for blocking. *Job: enumerate everything related to a known bad so it can be blocked.*

### J3 — Compromised Users (10 steps)
Analyst pivots from a threat to its **Recipient Email Addresses** (the targeted users `rcastle@acme.com` …), then runs **Transforms**: *"Check for clicks by users (Splunk Query)"* and *"Check for anonymous login activity"* to determine **who actually clicked / got compromised**, then **Add to PTR** to remediate those accounts. *Job: from a threat, find and remediate affected people.*

### J4 — Sender IP (7 steps)
Analyst investigates a **sending IP** as the pivot — its role (`Sender, IOC, ET IP`), ASN, and what campaigns/messages it's behind. *Job: attribute and scope an infrastructure indicator.*

**Cross-journey pattern:** every journey is **pivot → expand → transform → inspect → act**. The redesign should make that loop frictionless and obvious; it is the product's heartbeat.

---

## 7. Cross-cutting system concerns

- **Auto-save + explicit save:** rolling auto-save of the last 2 generated graphs; permanent save to dashboard with name (48-char max), visibility, generated-on/by metadata. Save states: New / Update / Save-as-new / Save-other-user's-as-new / saving / saved / failed (report sent) / confirm-overwrite.
- **VIP nodes:** highlight high-value targets; admin toggle (enabled/disabled); dedicated node treatment.
- **Masquerade mode:** SE/support "view as customer" — implies **role-based access** (Privileges settings, Revoke confirmation).
- **Notifications:** bell indicator (on/off), notifications panel — for graph-ready, threats, system events ⊳.
- **Date range:** global temporal filter on the whole investigation (24h / week / month / custom).
- **Error & loader taxonomy (12 states):** app load error, page-wide loader, graph error, generic data-load failure, node expand load failure, per-node loaders, search results empty, typeahead null (no results / custom range), typeahead network failure, search result error, table error / no content, empty dashboard. **Per-node and per-table failure isolation is a deliberate design value** — one failure shouldn't blank the canvas.

---

## 8. Component-library inventory (the 291 symbols → redesign component scope)

The legacy library already enumerates the system. Grouped:

- **Nodes:** the 5-axis system above (Single/Group/Focused × 6 colors × selection × stroke × size × label direction) + VIP + SID + neighbor + per-node loaders.
- **Tables:** the workhorse. Header-bar + row variants for **every** detail context: Hashes, URLs, Domains, IP Addresses, Campaigns, SIDs, Email Threats, and **Forensics** sub-tables (DNS / Connections / HTTP Requests / Process Activity / File Activity / Registry Activity / Mutex / IDS Events). Plus Settings tables (Privileges, Organization/VIP, Connected Apps/Splunk). Title bars, search title bars, selected/unselected rows.
- **Forms (Light + Dark themes):** Text Field/Box (empty/filled), Dropdown (underline/no-underline, open, normal/small), Checkbox, Radio, Switch, Slider, form labels.
- **Buttons (Light + Dark):** Raised / Flat × Normal/Focused/Pressed/Disabled/Secondary; Button-Icon, Button Bar.
- **Icons:** sizes 16/24/48 × Light/Dark × Primary/Secondary/Disabled; Alert (Red/Orange/Green); Link (Active/Focused/Visited); Node (per color); **Threat** (Spam/Phish/Phish-Campaign).
- **Navigation:** App nav, Global nav, Left-nav icons (Normal/Hover/Active), Search bar (light/dark, keyword entry, active), App Switcher.
- **Tabs:** 2–8 item bars; page tabs (icon/text, active/inactive).
- **Overlays / feedback:** Tooltip, **Hovercard** (8 anchor positions), Toast/snackbar (single/multi-line, carousel, BG: OK/Alert/Error/Normal), Loader (small/medium/large/bar), Menu + Cascade (small/full/large), Pill, Indicator (selected/unselected × default/red/orange), Scrollbar, High-priority indicator, Caption.

**Two explicit themes already exist (Light + Dark).** Dark mode is not a nice-to-have here — SOC analysts live in dark rooms; treat **dark as a first-class (likely default) theme.**

---

## 9. Open questions to resolve before/with architecture

1. ~~**Node color semantics**~~ ✅ **RESOLVED** — color = entity type; severity is a separate channel (§3, arch §5).
2. ~~**Scale targets**~~ ✅ **RESOLVED** — hundreds → low thousands post-aggregation; React Flow + graphology (arch §3).
3. **Verdict scale** — exact values & order (Malicious / Phishing / Suspicious / Medium / Benign / Unknown?) and how Score (0–100) maps to it. *Needed to build the severity channel.*
4. **Entity-family → color map** — which of the ~14 `EntityType`s map to each of the 6 legacy node colors. *I'll propose this when building the L3 node primitive.*
5. **Transforms catalog** — is the transform list fixed, or admin/data-driven (extensible)? Registry is built to allow either; confirms how dynamic.
6. **"Reports"** nav — in scope for redesign? No screens exist in source.
7. **Real-time** — do graphs update live as new TAP data arrives, or are they point-in-time snapshots refreshed on demand ("Refreshed Graph" / "Graph Refresh" suggest manual refresh)?
8. **Multi-tenant / RBAC** — Masquerade + Privileges imply SE/admin/analyst roles; confirm the role matrix.
9. **Hostname vs Domain, Email vs Recipient Email** — confirm these are genuinely distinct model types (§2.2).

---

## 10. Implications for architecture (bridge to doc 02)

What discovery forces the architecture to deliver:

1. **A graph-canvas engine is the central technical bet** — heterogeneous typed multigraph, node grouping/aggregation, hide/expand, marquee select, per-node async load+error, focus/recenter, zoom, save/restore of full graph state. This is the make-or-break decision.
2. **A typed entity/transform domain layer** — closed entity vocabulary, a relationship model, and a **transform registry** (Ops vs Transforms vs Actions) that is data-driven and extensible.
3. **Shared design-system components used *everywhere*, including inside the canvas** (your stated constraint): node cards, labels, badges, tooltips, hovercards, context menus, the detail-pane tables — all compose the same primitives as the shell. The seam is **presentation primitives (shared) vs. graph mechanics (owned)**, *not* "DS vs. graph."
4. **Dark-first theming** via tokens (Light + Dark already exist in source).
5. **Table-heavy detail surfaces** — a serious data-table primitive (sortable, filterable, customizable columns, virtualized, per-table error/empty) is a tier-1 component, not an afterthought.
6. **Integration boundary** — TAP / Splunk / PTR adapters behind a clean port, so the canvas/domain never import vendor specifics.
7. **State isolation & resilience** — per-node and per-panel failure isolation as a first-class architectural value.

→ Continued in `02-architecture-stack.md`.
