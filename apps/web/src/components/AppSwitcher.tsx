/**
 * App switcher — the grid menu that pivots between Proofpoint-suite apps (Nexus is the
 * current one). Composes the DS Popover (Radix) for focus/escape/outside-click/collision.
 * Figurative: tiles are presentational.
 */
import { Icon, Tooltip, Popover, PopoverTrigger, PopoverContent } from "@nexus/ui/nexus";

const APPS = [
  { name: "Nexus Threat Explorer", icon: "hub", active: true },
  { name: "Targeted Attack Protection", icon: "security" },
  { name: "Email Protection", icon: "mail" },
  { name: "Threat Response", icon: "bolt" },
  { name: "Security Awareness", icon: "school" },
  { name: "Information Protection", icon: "lock" },
];

export function AppSwitcher() {
  return (
    <Popover>
      <Tooltip label="Switch apps" side="bottom">
        <PopoverTrigger asChild>
          <button
            aria-label="Switch apps"
            className="grid h-9 w-9 place-items-center rounded text-[var(--nx-fg-muted)] hover:bg-[var(--nx-surface-3)] hover:text-[var(--nx-fg)] data-[state=open]:text-[var(--nx-fg)]"
          >
            <Icon name="apps" size={22} />
          </button>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent align="start" className="w-[300px] p-2">
        <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--nx-fg-subtle)]">Converged Intelligence</p>
        <div className="grid grid-cols-3 gap-1">
          {APPS.map((a) => (
            <button
              key={a.name}
              className={
                "flex flex-col items-center gap-1.5 rounded-md p-3 text-center hover:bg-[var(--nx-surface-3)] " +
                (a.active ? "text-[var(--nx-accent)]" : "text-[var(--nx-fg-muted)]")
              }
            >
              <Icon name={a.icon} size={24} filled={Boolean(a.active)} />
              <span className="text-[10px] leading-tight">{a.name}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
