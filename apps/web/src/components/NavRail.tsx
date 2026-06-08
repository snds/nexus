/**
 * Left navigation rail. Vertical icon nav for the app's top-level surfaces. The active
 * item is marked by a filled Material Symbol + an accent rail/tint (house rule: fill is
 * reserved for active states). Settings is pinned to the bottom; primary surfaces sit at
 * the top. Items are presentational in this scaffold.
 */
import { Icon, Tooltip } from "@nexus/ui/nexus";

export type NavKey = "graph" | "dashboard" | "search" | "settings";

type Item = { key: NavKey; icon: string; label: string };

const TOP: Item[] = [
  { key: "graph", icon: "hub", label: "Threat Graph" },
  { key: "dashboard", icon: "dashboard", label: "Dashboard" },
  { key: "search", icon: "search", label: "Search" },
];

const BOTTOM: Item[] = [{ key: "settings", icon: "settings", label: "Settings" }];

export function NavRail({ active = "graph", onSelect }: { active?: NavKey; onSelect?: (key: NavKey) => void }) {
  const renderItem = (it: Item) => {
    const isActive = it.key === active;
    return (
      <Tooltip key={it.key} label={it.label} side="right">
        <button
          onClick={() => onSelect?.(it.key)}
          aria-label={it.label}
          aria-current={isActive ? "page" : undefined}
          className={
            "relative grid h-10 w-10 place-items-center rounded-lg transition-colors " +
            (isActive
              ? "bg-[hsl(var(--nx-accent)/0.14)] text-[hsl(var(--nx-accent))]"
              : "text-[hsl(var(--nx-fg-subtle))] hover:bg-[hsl(var(--nx-surface-3))] hover:text-[hsl(var(--nx-fg))]")
          }
        >
          {isActive && (
            <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-[hsl(var(--nx-accent))]" />
          )}
          <Icon name={it.icon} size={22} filled={isActive} />
        </button>
      </Tooltip>
    );
  };

  return (
    <nav
      aria-label="Primary"
      className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-1))] py-3"
    >
      {TOP.map(renderItem)}
      <div className="mt-auto" />
      {BOTTOM.map(renderItem)}
    </nav>
  );
}
