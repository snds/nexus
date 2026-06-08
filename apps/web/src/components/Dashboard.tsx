/**
 * Dashboard / Saved Graphs — replicates the "My Saved Graphs" screens: My-Saved vs
 * All-Graphs tabs, keyword filter, sort control, grid⇄list toggle, and saved-graph
 * cards/rows (thumbnail, visibility, name, date, owner, kebab → Open / Duplicate / Delete).
 */
import { useState, type MouseEvent, type ReactNode } from "react";
import { Icon, StateBlock, Tooltip } from "@nexus/ui/nexus";
import type { SavedGraph } from "../savedGraphs.js";
import { GraphThumbnail } from "./GraphThumbnail.js";

export function Dashboard({
  graphs,
  onOpen,
  onDelete,
  onDuplicate,
  onNew,
}: {
  graphs: SavedGraph[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onNew?: () => void;
}) {
  const [tab, setTab] = useState<"mine" | "all">("mine");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);

  const rows = graphs.filter(
    (g) => (tab === "all" || g.generatedBy === "You") && g.name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[hsl(var(--nx-bg))]">
      {/* tabs */}
      <div role="tablist" className="flex justify-center border-b border-[hsl(var(--nx-border))]">
        <TabBtn active={tab === "mine"} onClick={() => setTab("mine")}>My Saved Graphs</TabBtn>
        <TabBtn active={tab === "all"} onClick={() => setTab("all")}>All Graphs</TabBtn>
      </div>

      {/* toolbar */}
      <div className="flex items-center gap-3 px-6 py-3">
        <div className="flex w-[280px] items-center gap-2 border-b border-[hsl(var(--nx-border))] pb-1">
          <Icon name="filter_list" size={16} className="text-[hsl(var(--nx-fg-subtle))]" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by keyword…"
            aria-label="Filter saved graphs"
            className="w-full bg-transparent text-sm text-[hsl(var(--nx-fg))] placeholder:text-[hsl(var(--nx-fg-subtle))] focus:outline-none"
          />
        </div>
        <span className="ml-auto flex items-center gap-1 text-xs text-[hsl(var(--nx-fg-muted))]">
          Sorted by most recent
          <Icon name="arrow_drop_down" size={18} className="text-[hsl(var(--nx-fg-subtle))]" />
        </span>
        <div className="flex items-center gap-1">
          <ToggleBtn active={view === "grid"} onClick={() => setView("grid")} icon="grid_view" label="Grid view" />
          <ToggleBtn active={view === "list"} onClick={() => setView("list")} icon="view_list" label="List view" />
        </div>
      </div>

      {/* content */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8">
        {rows.length === 0 ? (
          <StateBlock
            kind="empty"
            icon="hub"
            title={filter ? "No matches" : "No saved graphs yet"}
            message={filter ? "No saved graphs match your filter." : "Run a search and save a graph to see it here."}
            className="h-full"
          />
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {rows.map((g) => (
              <div
                key={g.id}
                role="button"
                tabIndex={0}
                onClick={() => onOpen(g.id)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen(g.id)}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-lg border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-1))] text-left transition-colors hover:border-[hsl(var(--nx-border-strong))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[hsl(var(--nx-ring))]"
              >
                <div className="border-b border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-bg))] p-2">
                  <GraphThumbnail seed={g.seed} className="h-24 w-full" />
                </div>
                <div className="flex items-start gap-2 p-3">
                  <Icon name={g.isPrivate ? "lock" : "visibility"} size={15} className="mt-0.5 text-[hsl(var(--nx-fg-subtle))]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[hsl(var(--nx-fg))]" title={g.name}>{g.name}</p>
                    <p className="text-[11px] text-[hsl(var(--nx-fg-subtle))]">
                      Generated on {g.generatedOn} · {g.nodeCount} nodes
                    </p>
                  </div>
                  <RowMenu
                    open={menuId === g.id}
                    onToggle={(e) => { e.stopPropagation(); setMenuId(menuId === g.id ? null : g.id); }}
                    onOpen={() => onOpen(g.id)}
                    onDuplicate={() => { onDuplicate(g.id); setMenuId(null); }}
                    onDelete={() => { onDelete(g.id); setMenuId(null); }}
                  />
                </div>
              </div>
            ))}
            {/* Trailing create affordance — fills the grid's empty slot and gives a direct
                "start a new graph" entry the reference lacked. Only on the user's own tab. */}
            {onNew && tab === "mine" && !filter && (
              <button
                onClick={onNew}
                className="group flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[hsl(var(--nx-border-strong))] bg-transparent text-[hsl(var(--nx-fg-subtle))] transition-colors hover:border-[hsl(var(--nx-accent))] hover:text-[hsl(var(--nx-accent))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[hsl(var(--nx-ring))]"
              >
                <Icon name="add_circle" size={26} />
                <span className="text-xs font-semibold uppercase tracking-wide">New saved graph</span>
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--nx-border))] text-left text-[11px] uppercase tracking-wide text-[hsl(var(--nx-fg-subtle))]">
                <th className="w-10 py-2 font-medium">Vis.</th>
                <th className="py-2 font-medium">Graph Name</th>
                <th className="py-2 font-medium">Generated On</th>
                <th className="py-2 font-medium">Generated By</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {rows.map((g) => (
                <tr
                  key={g.id}
                  onClick={() => onOpen(g.id)}
                  className="cursor-pointer border-b border-[hsl(var(--nx-border))] hover:bg-[hsl(var(--nx-surface-1))]"
                >
                  <td className="py-2.5">
                    <Icon name={g.isPrivate ? "lock" : "visibility"} size={15} className="text-[hsl(var(--nx-fg-subtle))]" />
                  </td>
                  <td className="py-2.5 font-medium text-[hsl(var(--nx-accent))]">{g.name}</td>
                  <td className="py-2.5 text-[hsl(var(--nx-fg-muted))]">{g.generatedOn}</td>
                  <td className="py-2.5 text-[hsl(var(--nx-fg-muted))]">{g.generatedBy}</td>
                  <td className="py-2.5">
                    <RowMenu
                      open={menuId === g.id}
                      onToggle={(e) => { e.stopPropagation(); setMenuId(menuId === g.id ? null : g.id); }}
                      onOpen={() => onOpen(g.id)}
                      onDuplicate={() => { onDuplicate(g.id); setMenuId(null); }}
                      onDelete={() => { onDelete(g.id); setMenuId(null); }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        "border-b-2 px-6 py-3 text-xs font-semibold uppercase tracking-wide " +
        (active
          ? "border-[hsl(var(--nx-accent))] text-[hsl(var(--nx-fg))]"
          : "border-transparent text-[hsl(var(--nx-fg-subtle))] hover:text-[hsl(var(--nx-fg-muted))]")
      }
    >
      {children}
    </button>
  );
}

function ToggleBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <Tooltip label={label} side="bottom">
      <button
        onClick={onClick}
        aria-label={label}
        aria-pressed={active}
        className={
          "grid h-8 w-8 place-items-center rounded " +
          (active ? "bg-[hsl(var(--nx-accent)/0.14)] text-[hsl(var(--nx-accent))]" : "text-[hsl(var(--nx-fg-subtle))] hover:bg-[hsl(var(--nx-surface-3))]")
        }
      >
        <Icon name={icon} size={20} filled={active} />
      </button>
    </Tooltip>
  );
}

function RowMenu({
  open,
  onToggle,
  onOpen,
  onDuplicate,
  onDelete,
}: {
  open: boolean;
  onToggle: (e: MouseEvent) => void;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const item = "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-[hsl(var(--nx-surface-3))]";
  return (
    <div className="relative">
      <Tooltip label="More actions" side="left">
        <button onClick={onToggle} aria-label="More actions" className="grid h-7 w-7 place-items-center rounded text-[hsl(var(--nx-fg-subtle))] hover:bg-[hsl(var(--nx-surface-3))] hover:text-[hsl(var(--nx-fg))]">
          <Icon name="more_vert" size={20} />
        </button>
      </Tooltip>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={onToggle} />
          <div className="absolute right-0 top-full z-40 mt-1 w-36 overflow-hidden rounded-md border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-2))] py-1 shadow-xl">
            <button className={item} onClick={(e) => { e.stopPropagation(); onOpen(); }}>
              <Icon name="open_in_new" size={15} /> Open
            </button>
            <button className={item} onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
              <Icon name="content_copy" size={15} /> Duplicate
            </button>
            <button className={item + " text-[hsl(var(--severity-malicious))]"} onClick={(e) => { e.stopPropagation(); onDelete(); }}>
              <Icon name="delete" size={15} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
