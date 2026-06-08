/**
 * L3 PRIMITIVE — NodeBadge. THE graph node, expressed as a pure, variant-driven component
 * so it maps 1:1 onto a Figma component set. Orthogonal visual channels (architecture §5):
 *
 *   family  → shape silhouette (● circle · ■ square · ◆ diamond · ⬡ hexagon)   [variant]
 *   role    → hub (root/focus, larger glyph) vs neighbor — both OUTLINED, both filled with
 *             the translucent app-bg token + a backdrop blur so edges recede behind them
 *   verdict → severity pip (own channel)                                        [variant]
 *   selected / focused / hidden → interaction states                            [variant/state]
 *   vip / status / imposter / hiddenChildren → unified indicator cluster        [flags/number]
 *
 * MOTION hooks (driven by CSS vars set on the RF node by GraphCanvas):
 *   .nx-shape       — the shape + glyph; scales in on enter, and scales on HOVER (icon scales
 *                     with it). Indicators/labels are OUTSIDE it, so they don't scale.
 *   .nx-after-land  — labels + indicators; fade in AFTER the node lands (delayed past travel).
 *
 * Figma component set: Node — properties { Family, Role, Verdict, Selected, Focused, Hidden,
 * VIP, Status, Imposter }. The data-bound <GraphNode> adapter derives these.
 */
import type { Verdict } from "@nexus/domain";
import { cn } from "../../lib/utils.js";
import { Icon } from "./Icon.js";
import { VerdictPip } from "./VerdictPip.js";
import { CountChip } from "./CountChip.js";
import { Tooltip } from "./Tooltip.js";
import type { NodeShape } from "./nodeShape.js";

export interface NodeBadgeProps {
  family: NodeShape;
  role?: "neighbor" | "hub";
  colorToken: string;
  glyph: string;
  label: string;
  sublabel?: string;
  verdict?: Verdict;
  selected?: boolean;
  focused?: boolean;
  hidden?: boolean;
  aggregate?: boolean;
  vip?: boolean;
  status?: "at_risk" | "impacted";
  imposter?: boolean;
  hiddenChildren?: number;
  className?: string;
}

const HUB_SIZE = 64;
const NODE_SIZE = 46;
// Regular flat-top hexagon (width:height = 1:0.866); shared by the SVG stroke + the clip-path
// fill so the blurred fill and the crisp border line up.
const HEX_POINTS = "98,50 74,8.4 26,8.4 2,50 26,91.6 74,91.6";
const HEX_CLIP = "polygon(98% 50%, 74% 8.4%, 26% 8.4%, 2% 50%, 26% 91.6%, 74% 91.6%)";

// Every node shares the central node's fill: translucent app-bg + a backdrop blur so the
// edge lines passing behind the node are softened and don't stand out. Both are tokens.
const FILL = "var(--nx-node-fill)";
const BLUR = "blur(var(--nx-node-blur))";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function NodeBadge({
  family,
  role = "neighbor",
  colorToken,
  glyph,
  label,
  sublabel,
  verdict,
  selected,
  focused,
  hidden,
  aggregate,
  vip,
  status,
  imposter,
  hiddenChildren,
  className,
}: NodeBadgeProps) {
  const hub = role === "hub";
  const colorVar = `hsl(var(--entity-${colorToken}))`;
  const size = hub ? HUB_SIZE : NODE_SIZE;

  const flags: { icon: string; bg: string; fg: string; title: string }[] = [];
  if (imposter) flags.push({ icon: "theater_comedy", bg: "hsl(var(--entity-sid))", fg: "hsl(var(--nx-accent-fg))", title: "Imposter / masquerade" });
  else if (status === "impacted") flags.push({ icon: "priority_high", bg: "hsl(var(--severity-malicious))", fg: "hsl(var(--nx-accent-fg))", title: "Impacted recipient" });
  else if (status === "at_risk") flags.push({ icon: "warning", bg: "hsl(var(--severity-suspicious))", fg: "hsl(var(--nx-bg))", title: "At-risk recipient" });
  if (vip) flags.push({ icon: "star", bg: "hsl(var(--severity-medium))", fg: "hsl(var(--nx-bg))", title: "VIP" });
  const count = hiddenChildren ?? 0;
  const hasIndicators = Boolean(verdict) || flags.length > 0 || count > 0;

  const fillStyle = { background: FILL, backdropFilter: BLUR, WebkitBackdropFilter: BLUR } as const;

  return (
    <div
      data-slot="node-badge"
      data-family={family}
      data-role={role}
      data-verdict={verdict}
      data-selected={selected || undefined}
      data-focused={focused || undefined}
      data-hidden={hidden || undefined}
      className={cn("group/badge flex w-[156px] flex-col items-center gap-1.5", hidden && "opacity-50", className)}
    >
      {/* ---- icon badge (shape = family) ---- */}
      <div className="relative grid place-items-center" style={{ width: size, height: size }}>
        {/* aggregate stack — offset peeks behind the badge signalling combined nodes */}
        {aggregate && (
          <>
            <span aria-hidden className="absolute" style={{ inset: 0, borderRadius: family === "circle" ? 9999 : 14, border: `2px solid ${colorVar}`, background: FILL, opacity: 0.35, transform: "translate(6px, 6px)" }} />
            <span aria-hidden className="absolute" style={{ inset: 0, borderRadius: family === "circle" ? 9999 : 14, border: `2px solid ${colorVar}`, background: FILL, opacity: 0.6, transform: "translate(3px, 3px)" }} />
          </>
        )}

        {/* nx-shape: shape + glyph. Scales in on enter and on hover (the glyph scales with it
            because it lives inside). Indicators/labels sit OUTSIDE so they hold steady. */}
        <div className="nx-shape absolute inset-0 grid place-items-center transition-transform duration-150 ease-out will-change-transform group-hover/badge:scale-[1.06]">
          {family === "hexagon" ? (
            <>
              <div aria-hidden className="absolute inset-0" style={{ clipPath: HEX_CLIP, ...fillStyle }} />
              <svg viewBox="0 0 100 100" width={size} height={size} className="absolute inset-0 overflow-visible" aria-hidden>
                {(selected || focused) && (
                  <polygon points={HEX_POINTS} fill="none" stroke={selected ? "hsl(var(--nx-ring))" : "hsl(var(--nx-ring) / 0.6)"} strokeWidth={selected ? 6 : 4} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                )}
                <polygon points={HEX_POINTS} fill="none" stroke={colorVar} strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </>
          ) : (
            <div
              aria-hidden
              className={cn(
                "absolute inset-0 m-auto border-2 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.6)]",
                selected && "ring-2 ring-[hsl(var(--nx-ring))] ring-offset-2 ring-offset-[hsl(var(--nx-bg))]",
                focused && !selected && "ring-2 ring-[hsl(var(--nx-ring))]/60",
              )}
              style={{
                width: family === "diamond" ? size * 0.72 : size,
                height: family === "diamond" ? size * 0.72 : size,
                borderRadius: family === "circle" ? 9999 : family === "square" ? 14 : 6,
                transform: family === "diamond" ? "rotate(45deg)" : undefined,
                borderColor: colorVar,
                ...fillStyle,
              }}
            />
          )}

          <span className="pointer-events-none absolute inset-0 grid place-items-center" style={{ color: colorVar }}>
            <Icon name={glyph} size={hub ? 32 : 22} filled={hub || Boolean(selected)} className="block" />
          </span>
        </div>

        {/* combined indicator cluster — one anchor, reads L→R; fades in after the node lands.
            Each indicator carries a tooltip so its meaning is discoverable on hover. */}
        {hasIndicators && (
          <div className="nx-after-land absolute -right-2 -top-2 z-20 flex items-center gap-0.5">
            {verdict && (
              <Tooltip label={`Verdict: ${cap(verdict)}`} side="top">
                <VerdictPip verdict={verdict} size={12} />
              </Tooltip>
            )}
            {flags.map((f) => (
              <Tooltip key={f.title} label={f.title} side="top">
                <span className="grid h-4 w-4 place-items-center rounded-full border-2 border-[hsl(var(--nx-bg))]" style={{ background: f.bg, color: f.fg }}>
                  <Icon name={f.icon} size={10} filled />
                </span>
              </Tooltip>
            ))}
            {count > 0 && (
              <Tooltip label={`${count} hidden ${count === 1 ? "node" : "nodes"}`} side="top">
                <CountChip count={count} />
              </Tooltip>
            )}
          </div>
        )}
      </div>

      {/* ---- label stack (fades in after landing) ---- */}
      <div className="nx-after-land flex max-w-full flex-col items-center text-center leading-tight">
        <span className="max-w-full truncate text-xs font-semibold text-[hsl(var(--nx-fg))]" title={label}>
          {label}
        </span>
        {sublabel && <span className="text-[10px] uppercase tracking-wide text-[hsl(var(--nx-fg-subtle))]">{sublabel}</span>}
      </div>
    </div>
  );
}
