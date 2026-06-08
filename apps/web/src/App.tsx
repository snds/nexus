import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { NexusGraph, GraphCanvas, radialLayout, assignDepths } from "@nexus/graph";
import {
  createDefaultRegistry,
  ENTITY_META,
  type CommandRegistry,
  type GraphCommand,
  type GraphFragment,
  type Entity,
  type EntityType,
  type Verdict,
} from "@nexus/domain";
import { mockPorts, seedGraph, ROOT_ID } from "@nexus/integrations";
import { VerdictBadge, EntityIcon, Icon, ToolButton } from "@nexus/ui/nexus";
import { NavRail, type NavKey } from "./components/NavRail.js";
import { TopBar } from "./components/TopBar.js";
import { UserSummary } from "./components/UserSummary.js";
import { IocResultCard } from "./components/IocResultCard.js";
import { Dashboard } from "./components/Dashboard.js";
import { DetailPage } from "./components/DetailPage.js";
import { SaveGraphDialog } from "./components/SaveGraphDialog.js";
import { SplunkLoginDialog } from "./components/SplunkLoginDialog.js";
import { ProductUpdates } from "./components/ProductUpdates.js";
import { ConfirmDialog } from "./components/ConfirmDialog.js";
import { Settings } from "./components/Settings.js";
import { TapPivot } from "./components/TapPivot.js";
import { SEED_SAVED_GRAPHS, today, type SavedGraph } from "./savedGraphs.js";

/** Max hops the user can expand before the graph recenters on the expanded node. */
const MAX_DEPTH = 3;

const VERDICT_RANK: Record<Verdict, number> = { malicious: 5, phishing: 4, suspicious: 3, medium: 2, benign: 1, unknown: 0 };
const worstVerdict = (vs: Verdict[]): Verdict => vs.reduce((a, b) => (VERDICT_RANK[b] > VERDICT_RANK[a] ? b : a), "unknown");

interface PanelState {
  open: boolean;
  id: string | null;
  loading: boolean;
  entity: Entity | null;
}
const CLOSED: PanelState = { open: false, id: null, loading: false, entity: null };

interface MenuState {
  id: string;
  x: number;
  y: number;
}

/** Pluralize an entity-type label for the neighbor grid (Address→Addresses, Hash→Hashes…). */
function plural(label: string): string {
  if (label === "Malware") return label; // mass noun
  if (/(s|x|z|ch|sh)$/i.test(label)) return `${label}es`;
  if (/[^aeiou]y$/i.test(label)) return `${label.slice(0, -1)}ies`;
  return `${label}s`;
}

/** Dummy descriptive copy per type for the detail pane's Description section. */
const DESCRIPTIONS: Partial<Record<EntityType, string>> = {
  campaign:
    "Messages purporting to be from a trusted sender deliver a malicious attachment that, once macros are enabled, fetches and executes the loader payload. High-volume distribution across US finance targets.",
  malware:
    "A modular banking trojan that harvests credentials and browser data, and acts as a loader for follow-on payloads. Communicates with C2 over HTTPS using a domain-generation algorithm.",
  actor:
    "A financially motivated threat actor active since 2017, known for high-volume malspam that delivers loaders and banking trojans to enterprise targets.",
  exploit:
    "Remote code execution in the MSHTML rendering engine, abused via crafted Office documents to gain initial execution without further user interaction.",
  prs_message:
    "Phishing message with a weaponized attachment. Sender display name spoofs a known vendor; the body references a fabricated invoice to induce the recipient to open the document.",
  email_address:
    "Recipient flagged as a VIP within TAP. Received an un-rewritten message associated with this campaign and is currently considered at risk.",
};

export function App() {
  const modelRef = useRef<NexusGraph | null>(null);
  if (modelRef.current === null) {
    const m = new NexusGraph();
    m.addFragment(seedGraph());
    assignDepths(m, ROOT_ID);
    radialLayout(m, { centerId: ROOT_ID });
    modelRef.current = m;
  }
  const model = modelRef.current;
  const registry = useMemo(() => createDefaultRegistry(), []);

  const [revision, setRevision] = useState(0);
  const [rootId, setRootId] = useState<string>(ROOT_ID);
  const [panel, setPanel] = useState<PanelState>(CLOSED);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [iocResult, setIocResult] = useState<{ title: string; fragment: GraphFragment } | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [view, setView] = useState<"graph" | "dashboard" | "detail" | "settings" | "tap">("graph");
  const [vipEnabled, setVipEnabled] = useState(true);
  const [masquerade, setMasquerade] = useState(false);
  const [highlightOn, setHighlightOn] = useState(false);
  const [detailEntity, setDetailEntity] = useState<Entity | null>(null);
  const [saved, setSaved] = useState<SavedGraph[]>(SEED_SAVED_GRAPHS);
  const [saveOpen, setSaveOpen] = useState(false);
  const [splunkConnected, setSplunkConnected] = useState(false);
  const [splunkLogin, setSplunkLogin] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const pendingSplunk = useRef<GraphCommand | null>(null);
  const reqRef = useRef<string | null>(null); // latest detail request — guards async races
  const groupsRef = useRef<Record<string, GraphFragment>>({}); // aggregateId → members (for ungroup)
  const groupSeq = useRef(0);
  const bump = useCallback(() => setRevision((r) => r + 1), []);

  // Left-click → momentary detail pane (skeleton while the mock fetch is in flight).
  const handleNodeClick = useCallback(
    (id: string, additive = false) => {
      // Shift/⌘-click → toggle into a multi-selection (for group/hide ops); panel untouched.
      if (additive) {
        const cur = model.nodes().find((n) => n.id === id)?.state.selected ?? false;
        model.setState(id, { selected: !cur });
        setMenu(null);
        bump();
        return;
      }
      model.clearSelection();
      model.setState(id, { selected: true });
      setMenu(null);
      setPanel({ open: true, id, loading: true, entity: null });
      reqRef.current = id;
      bump();
      void mockPorts.tap.getEntity(id).then((entity) => {
        if (reqRef.current !== id) return; // a newer click superseded this one
        setPanel((p) => (p.id === id ? { ...p, loading: false, entity } : p));
      });
    },
    [model, bump],
  );

  // Right-click → open the command context menu. Preserve an existing multi-selection when
  // the target is already selected; otherwise select just it.
  const handleNodeContextMenu = useCallback(
    (id: string, x: number, y: number) => {
      const isSelected = model.nodes().find((n) => n.id === id)?.state.selected ?? false;
      if (!isSelected) {
        model.clearSelection();
        model.setState(id, { selected: true });
      }
      bump();
      setMenu({ id, x, y });
    },
    [model, bump],
  );

  // Search → graph pivot: bring the chosen entity (+ its neighbors) onto the canvas,
  // recenter the graph on it, and open its detail. This is the search→graph traversal.
  const handleSearchSelect = useCallback(
    async (id: string) => {
      if (!model.g.hasNode(id)) {
        const ent = await mockPorts.tap.getEntity(id);
        if (ent) model.addFragment({ entities: [ent], relationships: [] });
        model.addFragment(await mockPorts.tap.expand(id));
      }
      setRootId(id);
      assignDepths(model, id);
      radialLayout(model, { centerId: id });
      model.clearSelection();
      model.setState(id, { selected: true });
      setMenu(null);
      setPanel({ open: true, id, loading: true, entity: null });
      reqRef.current = id;
      bump();
      void mockPorts.tap.getEntity(id).then((entity) => {
        if (reqRef.current !== id) return;
        setPanel((p) => (p.id === id ? { ...p, loading: false, entity } : p));
      });
    },
    [model, bump],
  );

  // Reveal one indicator type from the grouped result card onto the graph.
  const revealIocType = useCallback(
    (type: EntityType) => {
      if (!iocResult) return;
      const ents = iocResult.fragment.entities.filter((e) => e.type === type);
      const ids = new Set(ents.map((e) => e.id));
      const rels = iocResult.fragment.relationships.filter((r) => ids.has(r.source) || ids.has(r.target));
      model.addFragment({ entities: ents, relationships: rels });
      assignDepths(model, rootId);
      radialLayout(model, { centerId: rootId });
      const remaining = iocResult.fragment.entities.filter((e) => e.type !== type);
      setIocResult(remaining.length > 0 ? { ...iocResult, fragment: { ...iocResult.fragment, entities: remaining } } : null);
      bump();
    },
    [iocResult, model, rootId, bump],
  );

  const revealIocAll = useCallback(() => {
    if (!iocResult) return;
    model.addFragment(iocResult.fragment);
    assignDepths(model, rootId);
    radialLayout(model, { centerId: rootId });
    setIocResult(null);
    bump();
  }, [iocResult, model, rootId, bump]);

  // Highlight-path mode: emphasize the selected node's lineage (ancestors + subtree),
  // de-emphasize everything else. Toggling off clears the dim.
  const clearHighlight = useCallback(() => {
    model.nodes().forEach((n) => n.state.dimmed && model.setState(n.id, { dimmed: false }));
    setHighlightOn(false);
    setNote(null);
  }, [model]);

  const toggleHighlight = useCallback(() => {
    if (highlightOn) {
      clearHighlight();
      bump();
      return;
    }
    const id = model.selected()[0]?.id;
    if (!id) {
      setNote("Select a node, then highlight its path");
      return;
    }
    const path = new Set<string>([id, ...model.descendants(id), ...model.ancestors(id)]);
    model.nodes().forEach((n) => model.setState(n.id, { dimmed: !path.has(n.id) }));
    setHighlightOn(true);
    setNote("Highlighting attack path");
    bump();
  }, [highlightOn, clearHighlight, model, bump]);

  // Lose focus → panel + menu close (momentary). Also clears any highlight.
  const handlePaneClick = useCallback(() => {
    model.clearSelection();
    reqRef.current = null;
    setPanel(CLOSED);
    setMenu(null);
    if (highlightOn) clearHighlight();
    bump();
  }, [model, bump, highlightOn, clearHighlight]);

  // ── Dashboard / saved graphs ─────────────────────────────────────────────
  const handleNav = useCallback((key: NavKey) => {
    if (key === "dashboard") setView("dashboard");
    else if (key === "graph") setView("graph");
    else if (key === "settings") setView("settings");
    // search / feedback are out of scope for the scaffold
  }, []);

  const openSavedGraph = useCallback(
    (id: string) => {
      const g = saved.find((s) => s.id === id);
      setView("graph");
      setNote(g ? `Opened “${g.name}”` : null);
    },
    [saved],
  );

  const deleteSavedGraph = useCallback((id: string) => setSaved((list) => list.filter((g) => g.id !== id)), []);

  const duplicateSavedGraph = useCallback(
    (id: string) =>
      setSaved((list) => {
        const g = list.find((s) => s.id === id);
        if (!g) return list;
        const copy: SavedGraph = { ...g, id: `${g.id}-copy-${list.length}`, name: `${g.name} (copy)`, generatedOn: today(), generatedBy: "You", isPrivate: true };
        return [copy, ...list];
      }),
    [],
  );

  const saveCurrentGraph = useCallback(
    (name: string, isPrivate: boolean) => {
      const g: SavedGraph = { id: `sg-new-${Date.now()}`, name, generatedOn: today(), generatedBy: "You", isPrivate, nodeCount: model.order, seed: model.order };
      setSaved((list) => [g, ...list]);
      setSaveOpen(false);
      setNote(`Saved “${name}”`);
    },
    [model],
  );

  // ── Splunk (figurative): query → results join the graph ──────────────────
  const runSplunkQuery = useCallback(
    async (cmd: GraphCommand) => {
      setMenu(null);
      setNote("Querying Splunk for user clicks…");
      bump();
      const result = await cmd.run({ selection: model.selected(), ports: mockPorts });
      await new Promise((r) => setTimeout(r, 600)); // figurative latency
      if (result.kind === "mutation" && result.addEntities) {
        const before = model.order;
        model.addFragment({ entities: result.addEntities, relationships: result.addRelationships ?? [] });
        assignDepths(model, rootId);
        radialLayout(model, { centerId: rootId });
        const n = model.order - before;
        setNote(`Splunk: clicks by ${n} user${n === 1 ? "" : "s"} joined the graph`);
      } else {
        setNote("Splunk: no matching activity");
      }
      bump();
    },
    [model, rootId, bump],
  );

  const onSplunkSubmit = useCallback(() => {
    setSplunkConnected(true);
    setSplunkLogin(false);
    const cmd = pendingSplunk.current;
    pendingSplunk.current = null;
    if (cmd) void runSplunkQuery(cmd);
  }, [runSplunkQuery]);

  const runCommand = useCallback(
    async (cmd: GraphCommand) => {
      setMenu(null);
      setNote(null);
      // Splunk flow (figurative): gate the Splunk query behind a login the first time.
      if (cmd.id === "check-user-clicks") {
        if (!splunkConnected) {
          pendingSplunk.current = cmd;
          setSplunkLogin(true);
        } else {
          void runSplunkQuery(cmd);
        }
        return;
      }
      const selId = model.selected()[0]?.id ?? null;
      const depth = (selId ? model.nodes().find((n) => n.id === selId)?.state.depth : undefined) ?? 0;
      const result = await cmd.run({ selection: model.selected(), ports: mockPorts });

      switch (result.kind) {
        case "mutation": {
          // Grouped transforms (Related IOCs / Attacker Infrastructure) surface a result
          // card first; the analyst reveals indicators onto the graph by type from there.
          if (cmd.class === "transform" && result.addEntities && result.addEntities.length > 0) {
            setIocResult({
              title: cmd.label,
              fragment: { entities: result.addEntities, relationships: result.addRelationships ?? [] },
            });
            setNote(`${cmd.label}: ${result.addEntities.length} related indicators`);
            break;
          }
          const orderBefore = model.order;
          if (result.addEntities) {
            model.addFragment({ entities: result.addEntities, relationships: result.addRelationships ?? [] });
          }
          const added = model.order - orderBefore; // net-new (already-present nodes dedupe out)
          // Recenter only when a furthest-ring expansion actually revealed new nodes —
          // expanding a leaf (nothing new) must not yank the graph onto it.
          let nextRoot = rootId;
          if (cmd.id === "expand" && selId && depth >= MAX_DEPTH && added > 0) {
            nextRoot = selId;
            setRootId(selId);
          }
          assignDepths(model, nextRoot);
          radialLayout(model, { centerId: nextRoot });
          const recentered = nextRoot !== rootId;
          setNote(`${cmd.label}: ${recentered ? "recentered · " : ""}+${added} node${added === 1 ? "" : "s"}`);
          break;
        }
        case "topology": {
          const sel = model.selected();
          let touched = false;

          if (result.op === "hide") sel.forEach((e) => model.setState(e.id, { hidden: true }));
          if (result.op === "unhide") sel.forEach((e) => model.setState(e.id, { hidden: false }));
          if (result.op === "pin") {
            sel.forEach((e) => {
              const cur = model.nodes().find((n) => n.id === e.id)?.state.pinned ?? false;
              model.setState(e.id, { pinned: !cur });
            });
          }

          if (result.op === "collapse" && sel[0]) {
            for (const d of model.descendants(sel[0].id)) model.removeNode(d);
            touched = true;
          }

          if (result.op === "group") {
            const byType = new Map<EntityType, Entity[]>();
            for (const e of sel) byType.set(e.type, [...(byType.get(e.type) ?? []), e]);
            for (const [type, members] of byType) {
              if (members.length < 2) continue;
              const first = members[0]!.id;
              const firstDepth = model.nodes().find((n) => n.id === first)?.state.depth ?? 1;
              const parent = [...model.g.neighbors(first)].find(
                (nb) => (model.nodes().find((n) => n.id === nb)?.state.depth ?? 99) < firstDepth,
              );
              const aggId = `agg-${type}-${groupSeq.current++}`;
              const aggEntity: Entity = { id: aggId, type, label: `${members.length} ${plural(ENTITY_META[type].label)}`, verdict: worstVerdict(members.map((m) => m.verdict)) };
              const memberIds = new Set(members.map((m) => m.id));
              const memberRels = model.edges().filter((r) => memberIds.has(r.source) || memberIds.has(r.target));
              groupsRef.current[aggId] = { entities: members, relationships: memberRels };
              members.forEach((m) => model.removeNode(m.id));
              model.addFragment({ entities: [aggEntity], relationships: parent ? [{ id: `gr-${aggId}`, source: parent, target: aggId, kind: "associated", directed: true }] : [] });
              model.setState(aggId, { aggregate: true });
              touched = true;
            }
          }

          if (result.op === "ungroup" && sel[0]) {
            const frag = groupsRef.current[sel[0].id];
            if (frag) {
              model.removeNode(sel[0].id);
              model.addFragment(frag);
              delete groupsRef.current[sel[0].id];
              touched = true;
            }
          }

          if (result.op === "reset") {
            setRootId(ROOT_ID);
            groupsRef.current = {};
            assignDepths(model, ROOT_ID);
            radialLayout(model, { centerId: ROOT_ID });
            handlePaneClick();
          } else if (touched) {
            assignDepths(model, rootId);
            radialLayout(model, { centerId: rootId });
          }
          setNote(cmd.label);
          break;
        }
        case "side-effect":
          setNote(result.note ?? cmd.label);
          break;
        default:
          break;
      }
      bump();
    },
    [model, rootId, bump, handlePaneClick, splunkConnected, runSplunkQuery],
  );

  // Keyboard map (architecture §4). Esc closes the menu first, then the detail pane.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") {
        if (menu) setMenu(null);
        else handlePaneClick();
        return;
      }
      const key = e.key.toLowerCase();
      if (key === "shift" || key === "control" || key === "meta" || key === "alt") return;
      const combo = (e.metaKey || e.ctrlKey ? "mod+" : "") + key;
      const cmd = registry.byShortcut(combo);
      if (!cmd || !cmd.appliesTo(model.selected())) return;
      e.preventDefault();
      void runCommand(cmd);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [registry, model, runCommand, handlePaneClick, menu]);

  // Toast/note is momentary — auto-dismiss so it never lingers stale (e.g. after a
  // highlight is toggled off). Persistent modes own their own banners, not `note`.
  useEffect(() => {
    if (!note) return;
    const t = window.setTimeout(() => setNote(null), 3000);
    return () => window.clearTimeout(t);
  }, [note]);

  const detail = panel.entity;

  return (
    <div className="flex h-full flex-col">
      {/* Full-width top bar spans the browser; the nav rail docks left BELOW it. */}
      <TopBar nodeCount={model.order} onSearchSelect={handleSearchSelect} onNotifications={() => setNotifOpen(true)} />
      <div className="flex min-h-0 min-w-0 flex-1">
        <NavRail active={view === "dashboard" ? "dashboard" : view === "settings" ? "settings" : "graph"} onSelect={handleNav} />
        <div className="flex min-w-0 flex-1 flex-col">

        {view === "settings" ? (
          <Settings
            splunkConnected={splunkConnected}
            onSplunkConnect={() => setSplunkConnected(true)}
            vipEnabled={vipEnabled}
            onToggleVip={setVipEnabled}
          />
        ) : view === "dashboard" ? (
          <Dashboard graphs={saved} onOpen={openSavedGraph} onDelete={(id) => setConfirmDeleteId(id)} onDuplicate={duplicateSavedGraph} onNew={() => setView("graph")} />
        ) : view === "detail" && detailEntity ? (
          <DetailPage
            entity={detailEntity}
            onBack={() => setView("graph")}
            onOpenOnGraph={(id) => {
              void handleSearchSelect(id);
              setView("graph");
            }}
          />
        ) : view === "tap" && detailEntity ? (
          <TapPivot entity={detailEntity} onBack={() => setView("graph")} />
        ) : (
        <div className="relative flex min-h-0 flex-1">
        <main className="relative min-w-0 flex-1">
          <ReactFlowProvider>
            <GraphCanvas
              model={model}
              revision={revision}
              rootId={rootId}
              vipEnabled={vipEnabled}
              onNodeClick={handleNodeClick}
              onNodeContextMenu={handleNodeContextMenu}
              onPaneClick={handlePaneClick}
            />
          </ReactFlowProvider>
          {/* canvas actions (top-right): save / highlight / history / masquerade.
              Sits above the detail panel and slides left of it when the panel is open,
              so the toolbar stays reachable while a node is selected. */}
          <div
            className={
              "absolute top-3 z-30 flex flex-col gap-1 transition-[right] duration-300 ease-out " +
              (panel.open ? "right-[352px]" : "right-3")
            }
          >
            <ToolButton icon="save" label="Save graph" tooltipSide="left" onClick={() => setSaveOpen(true)} />
            <ToolButton icon="route" label="Highlight attack path" tooltipSide="left" active={highlightOn} onClick={toggleHighlight} />
            <ToolButton icon="history" label="Graph history" tooltipSide="left" />
            <ToolButton icon="theater_comedy" label="Masquerade mode" tooltipSide="left" active={masquerade} onClick={() => setMasquerade((v) => !v)} />
          </div>
          {masquerade && (
            <div className="absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[hsl(var(--entity-sid)/0.5)] bg-[hsl(var(--entity-sid)/0.15)] px-3 py-1.5 text-xs text-[hsl(var(--entity-sid))]">
              <Icon name="theater_comedy" size={14} filled />
              Masquerade mode — sender impersonation highlighted
            </div>
          )}
          {note && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-2))] px-3 py-1.5 text-xs shadow">
              {note}
            </div>
          )}
          {iocResult && (
            <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2">
              <IocResultCard
                title={iocResult.title}
                entities={iocResult.fragment.entities}
                onReveal={revealIocType}
                onRevealAll={revealIocAll}
                onClose={() => setIocResult(null)}
              />
            </div>
          )}
        </main>

        {/* Momentary detail pane — slides in on focus, out on blur. Content only; commands
            live in the right-click context menu. */}
        <aside
          aria-hidden={!panel.open}
          className={
            "absolute right-0 top-0 z-10 h-full w-[340px] overflow-y-auto border-l border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-1))] shadow-2xl transition-transform duration-300 ease-out " +
            (panel.open ? "translate-x-0" : "translate-x-full")
          }
        >
          {panel.loading || !detail ? (
            <DetailSkeleton />
          ) : (
            <DetailContent
              entity={detail}
              onClose={handlePaneClick}
              onViewFullDetails={() => {
                setDetailEntity(detail);
                setView("detail");
              }}
              onViewInTap={() => {
                setDetailEntity(detail);
                setView("tap");
              }}
            />
          )}
        </aside>
        </div>
        )}
        </div>
      </div>

      {notifOpen && <ProductUpdates onClose={() => setNotifOpen(false)} />}
      {confirmDeleteId && (
        <ConfirmDialog
          title="Delete saved graph?"
          message={`“${saved.find((g) => g.id === confirmDeleteId)?.name ?? "This graph"}” will be permanently removed. This can’t be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            deleteSavedGraph(confirmDeleteId);
            setConfirmDeleteId(null);
          }}
          onClose={() => setConfirmDeleteId(null)}
        />
      )}
      {saveOpen && <SaveGraphDialog onSave={saveCurrentGraph} onClose={() => setSaveOpen(false)} />}
      {splunkLogin && (
        <SplunkLoginDialog
          onSubmit={onSplunkSubmit}
          onClose={() => {
            setSplunkLogin(false);
            pendingSplunk.current = null;
          }}
        />
      )}

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          registry={registry}
          selection={model.selected()}
          onRun={(c) => void runCommand(c)}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
}

/* ── Right-click command menu (Ops / Transforms / Actions from the registry) ──────────── */
function ContextMenu({
  x,
  y,
  registry,
  selection,
  onRun,
  onClose,
}: {
  x: number;
  y: number;
  registry: CommandRegistry;
  selection: readonly Entity[];
  onRun: (cmd: GraphCommand) => void;
  onClose: () => void;
}) {
  const groups: { title: string; cls: "op" | "transform" | "action" }[] = [
    { title: "Node Ops", cls: "op" },
    { title: "Transforms", cls: "transform" },
    { title: "Actions", cls: "action" },
  ];
  // Clamp so the menu never overflows the viewport edges.
  const left = Math.min(x, window.innerWidth - 240);
  const top = Math.min(y, window.innerHeight - 320);

  return (
    <>
      {/* invisible backdrop closes the menu on any outside click / right-click */}
      <div className="fixed inset-0 z-40" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      <div
        role="menu"
        className="fixed z-50 w-[224px] overflow-hidden rounded-lg border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-2))] py-1 text-[hsl(var(--nx-fg))] shadow-2xl"
        style={{ left, top }}
      >
        {groups.map((g, gi) => {
          const cmds = registry.forSelection(selection, g.cls);
          if (cmds.length === 0) return null;
          return (
            <div key={g.cls}>
              {gi > 0 && <div className="my-1 h-px bg-[hsl(var(--nx-border))]" />}
              <p className="px-3 pb-0.5 pt-1 text-[9px] font-semibold uppercase tracking-wider text-[hsl(var(--nx-fg-subtle))]">
                {g.title}
              </p>
              {cmds.map((c) => (
                <button
                  key={c.id}
                  role="menuitem"
                  onClick={() => onRun(c)}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-[hsl(var(--nx-surface-3))]"
                >
                  <span>{c.label}</span>
                  {c.shortcut && <span className="ml-3 text-[10px] text-[hsl(var(--nx-fg-subtle))]">{c.shortcut}</span>}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ── Detail pane content (replicates the "Open Detail Panel — Focused Node" design) ────── */
function CloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      aria-label="Close detail panel"
      className="grid h-7 w-7 shrink-0 place-items-center rounded text-[hsl(var(--nx-fg-subtle))] hover:bg-[hsl(var(--nx-surface-3))] hover:text-[hsl(var(--nx-fg))]"
    >
      <Icon name="close" size={18} />
    </button>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        "border-b-2 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide " +
        (active
          ? "border-[hsl(var(--nx-accent))] text-[hsl(var(--nx-fg))]"
          : "border-transparent text-[hsl(var(--nx-fg-subtle))] hover:text-[hsl(var(--nx-fg-muted))]")
      }
    >
      {children}
    </button>
  );
}

function NeighborGrid({ neighbors }: { neighbors: [EntityType, number][] }) {
  return (
    <div className="grid grid-cols-3 gap-x-2 gap-y-3">
      {neighbors.map(([t, n]) => (
        <div key={t} className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <EntityIcon type={t} size={14} />
            <span className="text-sm font-bold tabular-nums text-[hsl(var(--nx-fg))]">{n}</span>
          </div>
          <span className="text-[10px] leading-tight text-[hsl(var(--nx-fg-subtle))]">
            {n === 1 ? ENTITY_META[t].label : plural(ENTITY_META[t].label)}
          </span>
        </div>
      ))}
    </div>
  );
}

function DetailContent({
  entity,
  onClose,
  onViewFullDetails,
  onViewInTap,
}: {
  entity: Entity;
  onClose: () => void;
  onViewFullDetails: () => void;
  onViewInTap: () => void;
}) {
  const meta = ENTITY_META[entity.type];
  const attrs = entity.attrs ? Object.entries(entity.attrs) : [];
  const neighbors = entity.neighborCounts
    ? (Object.entries(entity.neighborCounts) as [EntityType, number][])
    : [];
  const description = DESCRIPTIONS[entity.type];
  const profile = entity.userProfile;
  const [tab, setTab] = useState<"summary" | "neighbors">("summary");

  // User node → tabbed identity panel (Summary / Neighbor Nodes).
  if (profile) {
    return (
      <div data-slot="detail-content" className="flex flex-col">
        <div className="flex items-center justify-between border-b border-[hsl(var(--nx-border))] pr-2">
          <div role="tablist" className="flex">
            <Tab active={tab === "summary"} onClick={() => setTab("summary")}>
              Summary
            </Tab>
            <Tab active={tab === "neighbors"} onClick={() => setTab("neighbors")}>
              Neighbor Nodes
            </Tab>
          </div>
          <CloseBtn onClose={onClose} />
        </div>
        {tab === "summary" ? (
          <UserSummary profile={profile} />
        ) : neighbors.length > 0 ? (
          <Section title="Neighbor Nodes">
            <NeighborGrid neighbors={neighbors} />
          </Section>
        ) : (
          <p className="p-4 text-xs text-[hsl(var(--nx-fg-subtle))]">No neighbor nodes loaded yet.</p>
        )}
      </div>
    );
  }

  return (
    <div data-slot="detail-content" className="flex flex-col">
      {/* header */}
      <div className="border-b border-[hsl(var(--nx-border))] p-4">
        <div className="mb-2 flex items-start gap-2.5">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2"
            style={{ borderColor: `hsl(var(--entity-${meta.colorToken}))`, background: "hsl(var(--nx-surface-2))" }}
          >
            <EntityIcon type={entity.type} size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold" title={entity.label}>
              {entity.label}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-[hsl(var(--nx-fg-subtle))]">{meta.label}</p>
          </div>
          <CloseBtn onClose={onClose} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <VerdictBadge verdict={entity.verdict} />
          {typeof entity.score === "number" && (
            <span className="text-xs text-[hsl(var(--nx-fg-muted))]">score {entity.score}</span>
          )}
        </div>
      </div>

      {/* affected users */}
      {entity.usersAtRisk ? (
        <div className="mx-4 mt-4 flex items-center gap-3 rounded-lg border border-[hsl(var(--severity-medium)/0.4)] bg-[hsl(var(--severity-medium)/0.08)] px-3 py-2.5">
          <span className="text-xl font-bold tabular-nums text-[hsl(var(--severity-medium))]">{entity.usersAtRisk}</span>
          <span className="text-xs leading-tight text-[hsl(var(--nx-fg-muted))]">
            Users impacted
            <br />
            <span className="text-[hsl(var(--nx-fg-subtle))]">in your organization</span>
          </span>
        </div>
      ) : null}

      {/* forensics / attributes */}
      {attrs.length > 0 && (
        <Section title="Forensics">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[11px]">
            {attrs.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-[hsl(var(--nx-fg-subtle))]">{k}</dt>
                <dd className="text-right text-[hsl(var(--nx-fg-muted))]">{String(v)}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {/* activity */}
      {(entity.firstSeen || entity.lastSeen) && (
        <Section title="Activity">
          <dl className="grid grid-cols-2 gap-y-1 text-[11px]">
            {entity.firstSeen && (
              <>
                <dt className="text-[hsl(var(--nx-fg-subtle))]">First seen</dt>
                <dd className="text-right text-[hsl(var(--nx-fg-muted))]">{entity.firstSeen}</dd>
              </>
            )}
            {entity.lastSeen && (
              <>
                <dt className="text-[hsl(var(--nx-fg-subtle))]">Last seen</dt>
                <dd className="text-right text-[hsl(var(--nx-fg-muted))]">{entity.lastSeen}</dd>
              </>
            )}
          </dl>
        </Section>
      )}

      {/* neighbor nodes — 3-column grid of icon + count + label (matches the design) */}
      {neighbors.length > 0 && (
        <Section title="Neighbor Nodes">
          <NeighborGrid neighbors={neighbors} />
        </Section>
      )}

      {/* description */}
      {description && (
        <Section title="Description">
          <p className="text-[11px] leading-relaxed text-[hsl(var(--nx-fg-muted))]">{description}</p>
        </Section>
      )}

      {/* external links (dummy) */}
      <div className="flex flex-col gap-1.5 p-4">
        <button className="rounded-md border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-2))] px-3 py-1.5 text-xs hover:bg-[hsl(var(--nx-surface-3))]">
          View VirusTotal Results ↗
        </button>
        <button onClick={onViewInTap} className="flex items-center justify-center gap-1.5 rounded-md border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-2))] px-3 py-1.5 text-xs hover:bg-[hsl(var(--nx-surface-3))]">
          <Icon name="security" size={14} className="text-[hsl(var(--nx-accent))]" /> View in TAP ↗
        </button>
        <button onClick={onViewFullDetails} className="rounded-md px-3 py-1.5 text-xs text-[hsl(var(--nx-accent))] hover:underline">
          View full details →
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-[hsl(var(--nx-border))] p-4">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--nx-fg-subtle))]">{title}</h3>
      {children}
    </div>
  );
}

/** Pulsing placeholder shown while a node's detail is fetched. */
function DetailSkeleton() {
  return (
    <div className="animate-pulse p-4" data-slot="detail-skeleton">
      <div className="mb-3 flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-lg bg-[hsl(var(--nx-surface-3))]" />
        <div className="flex-1">
          <div className="mb-1.5 h-4 w-40 rounded bg-[hsl(var(--nx-surface-3))]" />
          <div className="h-2.5 w-16 rounded bg-[hsl(var(--nx-surface-3))]" />
        </div>
      </div>
      <div className="mb-4 h-5 w-24 rounded-full bg-[hsl(var(--nx-surface-3))]" />
      {[0, 1].map((i) => (
        <div key={i} className="mb-4">
          <div className="mb-2 h-2.5 w-20 rounded bg-[hsl(var(--nx-surface-3))]" />
          <div className="space-y-1.5">
            <div className="h-3 w-full rounded bg-[hsl(var(--nx-surface-3))]" />
            <div className="h-3 w-5/6 rounded bg-[hsl(var(--nx-surface-3))]" />
            <div className="h-3 w-4/6 rounded bg-[hsl(var(--nx-surface-3))]" />
          </div>
        </div>
      ))}
    </div>
  );
}
