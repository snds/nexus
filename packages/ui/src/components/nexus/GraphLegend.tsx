/**
 * L3 — GraphLegend. The at-a-glance key for the circular node language (source design
 * intent: "visual indicators supported by a legend definition"). Decodes the three
 * orthogonal channels — entity color, verdict severity, and node role/state — so a SOC
 * analyst can read the graph cold.
 *
 * Dynamic: only renders the entity types actually present on the canvas, grouped into
 * families for scanning. Families are a PRESENTATION grouping (not a token fork); colors
 * resolve from the same --entity-* / --severity-* tokens the nodes use.
 */
import { useState } from "react";
import type { EntityType, Verdict } from "@nexus/domain";
import { ENTITY_META } from "@nexus/domain";
import { EntityIcon } from "./EntityIcon.js";
import type { NodeShape } from "./nodeShape.js";

/** Family buckets — aligned 1:1 with the node shape channel (shapeOf in GraphNode).
 *  The header silhouette is the legend's contract for "shape = family". */
const FAMILIES: { label: string; shape: NodeShape; types: EntityType[] }[] = [
  { label: "Threat", shape: "circle", types: ["actor", "campaign", "malware"] },
  { label: "Infrastructure", shape: "square", types: ["ip", "domain", "hostname", "url", "hash", "filename"] },
  { label: "Detection", shape: "diamond", types: ["exploit", "sid", "scan"] },
  { label: "Messages", shape: "hexagon", types: ["email_address", "prs_message"] },
];

const VERDICT_LABEL: Record<Verdict, string> = {
  malicious: "Malicious",
  phishing: "Phishing",
  suspicious: "Suspicious",
  medium: "Medium",
  benign: "Benign",
  unknown: "Unknown",
};

export interface GraphLegendProps {
  /** Entity types present on the canvas — drives which rows show. */
  types: EntityType[];
  /** Verdicts present on the canvas — drives the severity key. */
  verdicts: Verdict[];
  /** Start collapsed (header only). Default expanded. */
  defaultCollapsed?: boolean;
  className?: string;
}

export function GraphLegend({ types, verdicts, defaultCollapsed = false, className }: GraphLegendProps) {
  const [open, setOpen] = useState(!defaultCollapsed);
  const present = new Set(types);
  const presentVerdicts = new Set(verdicts);
  const families = FAMILIES.map((f) => ({ ...f, types: f.types.filter((t) => present.has(t)) })).filter(
    (f) => f.types.length > 0,
  );

  return (
    <div
      data-slot="graph-legend"
      data-collapsed={!open || undefined}
      className={
        "w-[200px] overflow-hidden rounded-lg border border-[var(--nx-border)] bg-[var(--nx-surface-1)]/95 text-[var(--nx-fg)] shadow-lg backdrop-blur " +
        (className ?? "")
      }
    >
      {/* Header doubles as the collapse toggle so the panel never permanently hides a node. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--nx-fg-subtle)] hover:text-[var(--nx-fg)]"
      >
        Legend
        <span className={"transition-transform duration-150 " + (open ? "" : "-rotate-90")} aria-hidden>
          ▾
        </span>
      </button>

      {open && (
      <div className="px-3 pb-3">
      {/* Entity types by family */}
      <div className="flex flex-col gap-2">
        {families.map((fam) => (
          <div key={fam.label}>
            <p className="mb-1 text-[9px] font-medium uppercase tracking-wide text-[var(--nx-fg-subtle)]">
              {fam.label}
            </p>
            <ul className="flex flex-col gap-1.5">
              {fam.types.map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  {/* Larger bare icon — at legend size the glyph reads better without the
                      shape outline (the on-canvas node shape isn't needed here). */}
                  <EntityIcon type={t} size={20} className="shrink-0" />
                  <span className="truncate text-[11px] text-[var(--nx-fg-muted)]">{ENTITY_META[t].label}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Verdict (severity) key */}
      {presentVerdicts.size > 0 && (
        <>
          <div className="my-2 h-px bg-[var(--nx-border)]" />
          <p className="mb-1 text-[9px] font-medium uppercase tracking-wide text-[var(--nx-fg-subtle)]">Verdict</p>
          <ul className="flex flex-col gap-1">
            {(Object.keys(VERDICT_LABEL) as Verdict[])
              .filter((v) => presentVerdicts.has(v))
              .map((v) => (
                <li key={v} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: `var(--severity-${v})` }}
                  />
                  <span className="text-[11px] text-[var(--nx-fg-muted)]">{VERDICT_LABEL[v]}</span>
                </li>
              ))}
          </ul>
        </>
      )}

      {/* Node role / state key */}
      <div className="my-2 h-px bg-[var(--nx-border)]" />
      <p className="mb-1 text-[9px] font-medium uppercase tracking-wide text-[var(--nx-fg-subtle)]">Indicators</p>
      <ul className="flex flex-col gap-1 text-[11px] text-[var(--nx-fg-muted)]">
        <li className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: "var(--nx-fg-muted)" }} />
          Root / focus node
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[var(--nx-fg-muted)]" />
          Related entity
        </li>
        <li className="flex items-center gap-2">
          <span className="rounded-full border border-[var(--nx-border-strong)] bg-[var(--nx-surface-2)] px-1 text-[9px] font-semibold">
            +N
          </span>
          Aggregated group
        </li>
      </ul>
      </div>
      )}
    </div>
  );
}
