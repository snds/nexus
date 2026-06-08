/**
 * L4 — GraphCanvas. The React Flow surface. Owns pan/zoom/selection chrome + node motion.
 *
 * MOTION: node POSITIONS are tweened in JS (rAF) — not via CSS transforms — so edges always
 * follow the live node centers and never draw ahead of an arriving node. On a command, NEW
 * nodes start at their parent's position and travel out (staggered); existing nodes glide to
 * their re-layout targets. The connecting edge for a new node stays hidden until that node
 * lands, then fades in. The shape+glyph scale-in and the label/indicator fade-in are CSS
 * beats keyed off the same per-node delay (see styles.css + NodeBadge). Feel is preset-driven
 * and reviewable via the on-canvas Motion panel. Everything respects prefers-reduced-motion.
 *
 * NOTE: the consumer must import "@xyflow/react/dist/style.css" once at the app root.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
  Panel,
  useReactFlow,
  useNodesState,
  type Edge,
  type NodeMouseHandler,
  type OnNodeDrag,
} from "@xyflow/react";
import type { EntityType, Verdict } from "@nexus/domain";
import { GraphLegend, ToolButton, shapeOf, type NodeShape } from "@nexus/ui/nexus";
import { nodeTypes, toFlow, type EntityFlowNode } from "./react-flow-adapter.js";
import type { NexusGraph } from "./model.js";

export interface GraphCanvasProps {
  model: NexusGraph;
  revision: number;
  rootId?: string;
  vipEnabled?: boolean;
  onNodeClick?: (id: string, additive: boolean) => void;
  onNodeContextMenu?: (id: string, x: number, y: number) => void;
  onPaneClick?: () => void;
}

// ── Motion presets (grounded in motion-principles) ──────────────────────────────
type PresetKey = "smooth" | "floaty" | "snappy" | "instant";
interface Preset { label: string; hint: string; dur: number; ease: (t: number) => number; css: string; enter: number; stagger: number }
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
const easeOutBack = (t: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const PRESETS: Record<PresetKey, Preset> = {
  smooth: { label: "Smooth", hint: "Calm ease-out — what most node tools use", dur: 300, ease: easeOutQuint, css: "cubic-bezier(0.16, 1, 0.3, 1)", enter: 0.8, stagger: 28 },
  floaty: { label: "Floaty", hint: "Gentle spring with a little elasticity", dur: 440, ease: easeOutBack, css: "cubic-bezier(0.34, 1.35, 0.55, 1)", enter: 0.55, stagger: 50 },
  snappy: { label: "Snappy", hint: "Fast and crisp — minimal motion", dur: 170, ease: easeOutCubic, css: "cubic-bezier(0.2, 0, 0, 1)", enter: 0.9, stagger: 14 },
  instant: { label: "Instant", hint: "No animation", dur: 0, ease: () => 1, css: "linear", enter: 1, stagger: 0 },
};
const PRESET_ORDER: PresetKey[] = ["smooth", "floaty", "snappy", "instant"];

const SNAP_GRID = 24;
const snap = (v: number) => Math.round(v / SNAP_GRID) * SNAP_GRID;
const GHOST = "color-mix(in srgb, var(--nx-fg-muted) 50%, transparent)";

function prefersReduced() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** Minimap node — same silhouette family, drawn into a centered SQUARE, uniform ghost fill. */
function miniShape(shape: NodeShape, x: number, y: number, w: number, h: number) {
  const s = Math.min(w, h);
  const ox = x + (w - s) / 2;
  const oy = y + (h - s) / 2;
  const cx = ox + s / 2;
  const cy = oy + s / 2;
  const f = { fill: GHOST } as const;
  switch (shape) {
    case "circle": return <circle cx={cx} cy={cy} r={s / 2} {...f} />;
    case "diamond": return <polygon points={`${cx},${oy} ${ox + s},${cy} ${cx},${oy + s} ${ox},${cy}`} {...f} />;
    case "hexagon": return <polygon points={`${ox},${cy} ${ox + s * 0.25},${oy} ${ox + s * 0.75},${oy} ${ox + s},${cy} ${ox + s * 0.75},${oy + s} ${ox + s * 0.25},${oy + s}`} {...f} />;
    default: return <rect x={ox} y={oy} width={s} height={s} rx={3} {...f} />;
  }
}

const parentOf = (id: string, edges: Edge[]) => edges.find((e) => e.target === id)?.source;
const delayStyle = (ms: number) => ({ ["--nx-enter-delay" as keyof CSSProperties]: `${ms}ms` } as CSSProperties);

export function GraphCanvas({ model, revision, rootId, vipEnabled = true, onNodeClick, onNodeContextMenu, onPaneClick }: GraphCanvasProps) {
  const derived = useMemo(() => toFlow(model, rootId, vipEnabled), [model, revision, rootId, vipEnabled]);
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const [interactive, setInteractive] = useState(true);
  const [preset, setPreset] = useState<PresetKey>("floaty");
  const [motionOpen, setMotionOpen] = useState(false);
  const [hiddenEdges, setHiddenEdges] = useState<Set<string>>(new Set());
  const p = PRESETS[preset];

  const [nodes, setNodes, onNodesChange] = useNodesState<EntityFlowNode>(derived.nodes);
  const seen = useRef<Set<string>>(new Set());
  const lastPos = useRef<Map<string, { x: number; y: number }>>(new Map());
  const raf = useRef<number | null>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = []; };

  // Tween node positions in JS so edges track the live centers. animMap: id → start/target/delay.
  const runTween = useCallback(
    (animMap: Map<string, { sx: number; sy: number; tx: number; ty: number; delay: number }>, dur: number, ease: (t: number) => number, onEnd: () => void) => {
      if (raf.current) cancelAnimationFrame(raf.current);
      const start = performance.now();
      const maxEnd = dur + Math.max(0, ...[...animMap.values()].map((a) => a.delay));
      const tick = (now: number) => {
        const t = now - start;
        setNodes((prev) =>
          prev.map((n) => {
            const a = animMap.get(n.id);
            if (!a) return n;
            const e = ease(clamp((t - a.delay) / dur, 0, 1));
            return { ...n, position: { x: lerp(a.sx, a.tx, e), y: lerp(a.sy, a.ty, e) } };
          }),
        );
        if (t < maxEnd) raf.current = requestAnimationFrame(tick);
        else { raf.current = null; onEnd(); }
      };
      raf.current = requestAnimationFrame(tick);
    },
    [setNodes],
  );

  // Animate from the previous graph to `derived` on every command/layout change.
  useEffect(() => {
    const targets = derived.nodes;
    const firstPaint = seen.current.size === 0;
    const newOnes = targets.filter((n) => !seen.current.has(n.id));
    const moved = targets.filter((n) => {
      const lp = lastPos.current.get(n.id);
      return seen.current.has(n.id) && lp && (lp.x !== n.position.x || lp.y !== n.position.y);
    });
    const finalize = () => {
      seen.current = new Set(targets.map((n) => n.id));
      lastPos.current = new Map(targets.map((n) => [n.id, n.position]));
    };

    if (prefersReduced() || p.dur === 0) {
      clearTimers();
      setNodes(targets);
      setHiddenEdges(new Set());
      finalize();
      return;
    }

    if (firstPaint) {
      // Intro: nodes scale-in place, edges fade in after.
      setNodes(targets);
      setHiddenEdges(new Set(derived.edges.map((e) => e.id)));
      clearTimers();
      timers.current.push(window.setTimeout(() => setHiddenEdges(new Set()), p.dur + 60));
      finalize();
      return;
    }

    if (newOnes.length === 0 && moved.length === 0) {
      // Nothing to animate → ensure no edge is left hidden (also a StrictMode safety net).
      setNodes(targets);
      setHiddenEdges((prev) => (prev.size ? new Set() : prev));
      finalize();
      return;
    }

    const order = new Map(newOnes.map((n, i) => [n.id, i]));
    const delayOf = (id: string) => (order.has(id) ? Math.min(order.get(id)!, 6) * p.stagger : 0);
    const startOf = (n: EntityFlowNode) => {
      if (order.has(n.id)) {
        const par = parentOf(n.id, derived.edges);
        return (par && lastPos.current.get(par)) || (par ? targets.find((t) => t.id === par)?.position : undefined) || n.position;
      }
      return lastPos.current.get(n.id) || n.position;
    };

    // Place nodes at their start; new nodes carry the per-node stagger delay for the CSS beats.
    setNodes(targets.map((n) => (order.has(n.id) ? { ...n, position: { ...startOf(n) }, style: delayStyle(delayOf(n.id)) } : { ...n, position: { ...startOf(n) } })));

    // Hide each entering edge until its child node lands, then fade in.
    const entering = derived.edges.filter((e) => order.has(e.target));
    setHiddenEdges(new Set(entering.map((e) => e.id)));
    clearTimers();
    entering.forEach((e) => {
      timers.current.push(window.setTimeout(() => setHiddenEdges((prev) => { const s = new Set(prev); s.delete(e.id); return s; }), delayOf(e.target) + p.dur));
    });

    const animMap = new Map(targets.map((n) => { const s = startOf(n); return [n.id, { sx: s.x, sy: s.y, tx: n.position.x, ty: n.position.y, delay: delayOf(n.id) }] as const; }));
    runTween(animMap, p.dur, p.ease, () => setNodes(targets.map((n) => ({ ...n }))));
    finalize();
  }, [derived, p.dur, p.ease, p.stagger, setNodes, runTween]);

  // Replay the whole expand for review: re-place every node at its parent, then fan out.
  const replay = useCallback(() => {
    if (p.dur === 0) return;
    const targets = derived.nodes;
    setNodes([]);
    requestAnimationFrame(() => {
      const order = new Map(targets.map((n, i) => [n.id, i]));
      const delayOf = (id: string) => Math.min(order.get(id) ?? 0, 6) * p.stagger;
      const startOf = (n: EntityFlowNode) => {
        const par = parentOf(n.id, derived.edges);
        return (par ? targets.find((t) => t.id === par)?.position : undefined) || n.position;
      };
      setNodes(targets.map((n) => ({ ...n, position: { ...startOf(n) }, style: delayStyle(delayOf(n.id)) })));
      setHiddenEdges(new Set(derived.edges.map((e) => e.id)));
      clearTimers();
      derived.edges.forEach((e) => timers.current.push(window.setTimeout(() => setHiddenEdges((prev) => { const s = new Set(prev); s.delete(e.id); return s; }), delayOf(e.target) + p.dur)));
      requestAnimationFrame(() => {
        const animMap = new Map(targets.map((n) => { const s = startOf(n); return [n.id, { sx: s.x, sy: s.y, tx: n.position.x, ty: n.position.y, delay: delayOf(n.id) }] as const; }));
        runTween(animMap, p.dur, p.ease, () => setNodes(targets.map((n) => ({ ...n }))));
      });
    });
  }, [derived, p, setNodes, runTween]);

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); clearTimers(); }, []);

  // Drop → soft snap to grid (short ease-out tween of just the dragged node). Persisted.
  const dropRaf = useRef<number | null>(null);
  const onNodeDragStop: OnNodeDrag<EntityFlowNode> = useCallback(
    (_evt, node) => {
      const from = { ...node.position };
      const to = { x: snap(from.x), y: snap(from.y) };
      model.setState(node.id, { x: to.x, y: to.y });
      if (dropRaf.current) cancelAnimationFrame(dropRaf.current);
      const start = performance.now();
      const tick = (now: number) => {
        const e = easeOutCubic(clamp((now - start) / 180, 0, 1));
        setNodes((ns) => ns.map((n) => (n.id === node.id ? { ...n, position: { x: lerp(from.x, to.x, e), y: lerp(from.y, to.y, e) } } : n)));
        if (now - start < 180) dropRaf.current = requestAnimationFrame(tick);
      };
      dropRaf.current = requestAnimationFrame(tick);
    },
    [setNodes, model],
  );

  const edges = useMemo(
    () => derived.edges.map((e) => (hiddenEdges.has(e.id) ? { ...e, style: { ...(e.style ?? {}), opacity: 0 } } : e)),
    [derived.edges, hiddenEdges],
  );

  // Minimap shape lookup.
  const shapeRef = useRef<Map<string, NodeShape>>(new Map());
  shapeRef.current = useMemo(() => {
    const m = new Map<string, NodeShape>();
    for (const n of model.nodes()) m.set(n.id, shapeOf(n.entity.type));
    return m;
  }, [model, revision]);
  const MiniNode = useCallback(
    (props: { x: number; y: number; width: number; height: number; id: string }) =>
      miniShape(shapeRef.current.get(props.id) ?? "circle", props.x, props.y, props.width, props.height),
    [],
  );

  const { types, verdicts } = useMemo(() => {
    const t = new Set<EntityType>();
    const v = new Set<Verdict>();
    for (const n of model.nodes()) { t.add(n.entity.type); v.add(n.entity.verdict); }
    return { types: [...t], verdicts: [...v] };
  }, [model, revision]);

  const handleNodeClick: NodeMouseHandler<EntityFlowNode> = (evt, node) => onNodeClick?.(node.id, evt.shiftKey || evt.metaKey || evt.ctrlKey);
  const handleNodeContextMenu: NodeMouseHandler<EntityFlowNode> = (evt, node) => { evt.preventDefault(); onNodeContextMenu?.(node.id, evt.clientX, evt.clientY); };
  const handlePaneClick = () => onPaneClick?.();

  const canvasStyle = {
    background: "var(--nx-bg)",
    ["--nx-node-dur" as string]: `${p.dur}ms`,
    ["--nx-node-ease" as string]: p.css,
    ["--nx-node-enter" as string]: `${p.enter}`,
  } as CSSProperties;

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onNodeClick={handleNodeClick}
      onNodeContextMenu={handleNodeContextMenu}
      onNodeDragStop={onNodeDragStop}
      onPaneClick={handlePaneClick}
      fitView
      fitViewOptions={{ padding: { left: "224px", top: "72px", right: "32px", bottom: "64px" } }}
      minZoom={0.2}
      maxZoom={2}
      panOnScroll
      zoomOnScroll={false}
      zoomOnPinch
      nodesDraggable={interactive}
      elementsSelectable={interactive}
      style={canvasStyle}
      colorMode="dark"
      proOptions={{ hideAttribution: true }}
    >
      <Background color="var(--nx-border)" gap={24} />

      <Panel position="bottom-left" className="flex items-end gap-2">
        <div className="flex flex-col gap-1">
          <ToolButton icon="add" label="Zoom in" tooltipSide="right" onClick={() => zoomIn()} />
          <ToolButton icon="remove" label="Zoom out" tooltipSide="right" onClick={() => zoomOut()} />
          <ToolButton icon="fit_screen" label="Fit to view" tooltipSide="right" onClick={() => fitView()} />
          <ToolButton icon={interactive ? "lock_open" : "lock"} label={interactive ? "Lock canvas" : "Unlock canvas"} tooltipSide="right" active={!interactive} onClick={() => setInteractive((v) => !v)} />
          <ToolButton icon="animation" label="Motion settings" tooltipSide="right" active={motionOpen} onClick={() => setMotionOpen((v) => !v)} />
        </div>

        {motionOpen && (
          <div className="w-60 rounded-lg border border-[var(--nx-border)] bg-[var(--nx-surface-1)]/95 p-3 shadow-2xl backdrop-blur">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--nx-fg-subtle)]">Node motion</p>
            <div className="flex flex-col gap-1">
              {PRESET_ORDER.map((key) => {
                const pr = PRESETS[key];
                const on = key === preset;
                return (
                  <button key={key} onClick={() => setPreset(key)} aria-pressed={on} className={"flex items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors " + (on ? "bg-[color-mix(in_srgb,var(--nx-accent)_14%,transparent)]" : "hover:bg-[var(--nx-surface-3)]")}>
                    <span className={"mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border-2 " + (on ? "border-[var(--nx-accent)]" : "border-[var(--nx-border-strong)]")}>
                      {on && <span className="h-1.5 w-1.5 rounded-full bg-[var(--nx-accent)]" />}
                    </span>
                    <span className="min-w-0">
                      <span className={"block text-xs font-medium " + (on ? "text-[var(--nx-accent)]" : "text-[var(--nx-fg)]")}>
                        {pr.label}
                        {pr.dur > 0 && <span className="ml-1 text-[10px] font-normal text-[var(--nx-fg-subtle)]">{pr.dur}ms</span>}
                      </span>
                      <span className="block text-[10px] leading-tight text-[var(--nx-fg-subtle)]">{pr.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <button onClick={replay} disabled={p.dur === 0} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-[var(--nx-surface-3)] px-3 py-1.5 text-xs font-semibold text-[var(--nx-fg)] hover:brightness-110 disabled:opacity-40">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden>replay</span>
              Replay expand
            </button>
          </div>
        )}
      </Panel>

      <MiniMap pannable zoomable nodeComponent={MiniNode} nodeColor={() => GHOST} />

      <Panel position="top-left">
        <GraphLegend types={types} verdicts={verdicts} defaultCollapsed />
      </Panel>
    </ReactFlow>
  );
}
