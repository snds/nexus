/**
 * Global search with a grouped typeahead (replicates the "Search-Typeahead" design):
 * results are grouped by entity type, each group headed by its icon + label, with a
 * "Showing last 7 days" scope chip and a "View all results" footer. Selecting a result
 * pivots the graph onto that entity.
 */
import { useEffect, useId, useRef, useState } from "react";
import { ENTITY_META, type Entity, type EntityType } from "@nexus/domain";
import { mockPorts } from "@nexus/integrations";
import { EntityIcon, Icon, Tooltip } from "@nexus/ui/nexus";

export function SearchBox({ onSelect }: { onSelect: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Entity[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  // Debounced search against the threat-data port.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      void mockPorts.tap.search(q).then((r) => {
        setResults(r);
        setLoading(false);
      });
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  // Close on outside click. Capture phase + pointerdown so it fires even when the click
  // lands on the graph canvas (React Flow stops pointer propagation in the bubble phase).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [open]);

  // Group results by entity type, preserving type order.
  const groups = new Map<EntityType, Entity[]>();
  for (const e of results) {
    const g = groups.get(e.type) ?? [];
    g.push(e);
    groups.set(e.type, g);
  }

  const pick = (id: string) => {
    onSelect(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-[520px]">
      <div className="flex h-9 items-center gap-2 rounded-md border border-[var(--nx-border)] bg-[var(--nx-surface-2)] px-3 focus-within:border-[var(--nx-ring)]">
        <Icon name="search" size={20} className="shrink-0 text-[var(--nx-fg-subtle)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="Search threats, indicators, users…"
          aria-label="Search"
          aria-expanded={open}
          aria-controls={listId}
          className="w-full bg-transparent text-sm text-[var(--nx-fg)] placeholder:text-[var(--nx-fg-subtle)] focus:outline-none"
        />
        {query && (
          <Tooltip label="Clear search" side="bottom">
            <button onClick={() => setQuery("")} aria-label="Clear search" className="shrink-0 text-[var(--nx-fg-subtle)] hover:text-[var(--nx-fg)]">
              <Icon name="close" size={20} />
            </button>
          </Tooltip>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[60vh] overflow-y-auto rounded-lg border border-[var(--nx-border)] bg-[var(--nx-surface-1)] shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-[var(--nx-border)] px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--nx-fg-subtle)]">
              {loading ? "Searching…" : `${results.length} result${results.length === 1 ? "" : "s"}`}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-[var(--nx-fg-subtle)]">
              <Icon name="calendar_today" size={13} /> Last 7 days
            </span>
          </div>

          {!loading && results.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-[var(--nx-fg-subtle)]">No matches for “{query}”.</p>
          )}

          {[...groups.entries()].map(([type, items]) => (
            <div key={type} className="border-b border-[var(--nx-border)] py-1 last:border-0">
              <div className="flex items-center gap-1.5 px-3 py-1">
                <EntityIcon type={type} size={14} />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--nx-fg-subtle)]">
                  {ENTITY_META[type].label}
                </span>
              </div>
              {items.map((e) => (
                <button
                  key={e.id}
                  role="option"
                  aria-selected={false}
                  onClick={() => pick(e.id)}
                  className="block w-full truncate px-3 py-1.5 pl-8 text-left text-xs text-[var(--nx-fg-muted)] hover:bg-[var(--nx-surface-3)] hover:text-[var(--nx-fg)]"
                  title={e.label}
                >
                  {e.label}
                </button>
              ))}
            </div>
          ))}

          {results.length > 0 && (
            <button className="w-full px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-[var(--nx-accent)] hover:underline">
              View all results
            </button>
          )}
        </div>
      )}
    </div>
  );
}
