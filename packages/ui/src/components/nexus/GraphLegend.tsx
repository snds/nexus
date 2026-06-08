/**
 * L3 — GraphLegend. The at-a-glance key for the node language. Decodes the channels a SOC
 * analyst reads cold: entity color (8 super-category FAMILIES), verdict severity, role/state.
 *
 * Grouped by the color FAMILY taxonomy (ENTITY_FAMILIES in @nexus/domain): the family swatch
 * teaches "color = family", and the per-type sub-rows teach "icon = the specific type within it".
 * Dynamic — only families/types actually on the canvas render. Colors resolve from the same
 * --entity-* / --severity-* tokens the nodes use (presentation grouping, not a token fork).
 */
import { useState } from "react";
import type { EntityType, Verdict } from "@nexus/domain";
import { ENTITY_META, ENTITY_FAMILIES } from "@nexus/domain";
import { EntityIcon } from "./EntityIcon.js";

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
  // Group present types under the color super-category families, in canonical order.
  const families = ENTITY_FAMILIES.map((fam) => ({
    ...fam,
    types: (Object.keys(ENTITY_META) as EntityType[]).filter(
      (t) => present.has(t) && ENTITY_META[t].family === fam.key,
    ),
  })).filter((f) => f.types.length > 0);

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
          <div key={fam.key}>
            {/* Family header: the color swatch IS the "color = family" contract. */}
            <p className="mb-1 flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wide text-[var(--nx-fg-subtle)]">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: `var(--entity-${ENTITY_META[fam.types[0]!].colorToken})` }}
                aria-hidden
              />
              {fam.label}
            </p>
            {/* Sub-rows: icon = the specific type within the family. */}
            <ul className="ml-1 flex flex-col gap-1.5 border-l border-[var(--nx-border)] pl-2.5">
              {fam.types.map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <EntityIcon type={t} size={18} className="shrink-0" />
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
