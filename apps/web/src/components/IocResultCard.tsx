/**
 * Grouped transform-result card (replicates the "Sender Infrastructure" card from the
 * Related-IOCs flow): a titled container listing the discovered indicators grouped by
 * type, with per-row counts. Revealing a row drops those nodes onto the graph; the row
 * clears once revealed. Floats over the canvas until dismissed.
 */
import { ENTITY_META, type Entity, type EntityType } from "@nexus/domain";
import { EntityIcon, Icon, Tooltip } from "@nexus/ui/nexus";

function plural(label: string): string {
  if (label === "Malware") return label;
  if (/(s|x|z|ch|sh)$/i.test(label)) return `${label}es`;
  if (/[^aeiou]y$/i.test(label)) return `${label.slice(0, -1)}ies`;
  return `${label}s`;
}

export function IocResultCard({
  title,
  entities,
  onReveal,
  onRevealAll,
  onClose,
}: {
  title: string;
  entities: Entity[];
  onReveal: (type: EntityType) => void;
  onRevealAll: () => void;
  onClose: () => void;
}) {
  // Group remaining (un-revealed) indicators by type.
  const groups = new Map<EntityType, number>();
  for (const e of entities) groups.set(e.type, (groups.get(e.type) ?? 0) + 1);

  return (
    <div className="w-[260px] overflow-hidden rounded-lg border border-[color-mix(in_srgb,var(--nx-accent)_50%,transparent)] bg-[var(--nx-surface-2)] shadow-2xl">
      <div className="flex items-center justify-between bg-[color-mix(in_srgb,var(--nx-accent)_16%,transparent)] px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--nx-fg)]">
          <Icon name="travel_explore" size={16} className="text-[var(--nx-accent)]" />
          {title}
        </span>
        <Tooltip label="Dismiss" side="left">
          <button onClick={onClose} aria-label="Dismiss" className="grid h-6 w-6 place-items-center rounded text-[var(--nx-fg-subtle)] hover:text-[var(--nx-fg)]">
            <Icon name="close" size={20} />
          </button>
        </Tooltip>
      </div>

      <ul className="flex flex-col">
        {[...groups.entries()].map(([type, count]) => (
          <li key={type}>
            <button
              onClick={() => onReveal(type)}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-[var(--nx-surface-3)]"
              title={`Reveal ${count} ${count === 1 ? ENTITY_META[type].label : plural(ENTITY_META[type].label)}`}
            >
              <EntityIcon type={type} size={16} />
              <span className="flex-1">
                <span className="text-sm font-bold tabular-nums text-[var(--nx-fg)]">{count}</span>
                <span className="ml-1.5 text-[11px] text-[var(--nx-fg-muted)]">
                  {count === 1 ? ENTITY_META[type].label : plural(ENTITY_META[type].label)}
                </span>
              </span>
              <Icon name="add_circle" size={16} className="text-[var(--nx-fg-subtle)]" />
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={onRevealAll}
        className="w-full border-t border-[var(--nx-border)] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--nx-accent)] hover:bg-[var(--nx-surface-3)]"
      >
        Reveal all on graph
      </button>
    </div>
  );
}
