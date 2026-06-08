/**
 * Date-range selector — the "Showing last 7 days" control. Composes the DS DropdownMenu
 * (Radix) so keyboard nav, focus, escape, outside-click, and collision are handled for us.
 * Figurative; selection updates the label only.
 */
import { useState } from "react";
import { Icon, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@nexus/ui/nexus";

const RANGES = ["Last 24 hours", "Last 7 days", "Last 30 days", "Last 90 days", "Custom range…"];

export function DateSelector() {
  const [range, setRange] = useState("Last 7 days");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-9 items-center gap-1.5 rounded-md border border-[var(--nx-border)] bg-[var(--nx-surface-2)] px-2.5 text-xs text-[var(--nx-fg-muted)] shadow hover:bg-[var(--nx-surface-3)]">
          <Icon name="calendar_today" size={20} />
          Showing {range.toLowerCase()}
          <Icon name="arrow_drop_down" size={20} className="text-[var(--nx-fg-subtle)]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        {RANGES.map((r) => (
          <DropdownMenuItem key={r} onSelect={() => setRange(r)} className="justify-between">
            {r}
            {r === range && <Icon name="check" size={18} className="text-[var(--nx-accent)]" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
