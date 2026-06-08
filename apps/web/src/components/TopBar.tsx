/**
 * Top app bar — brand (logo + wordmark), global search, and account actions. Replaces the
 * Proofpoint chrome with a Nexus identity. Account/help/notification icons are outlined
 * (no active state here).
 */
import { Icon, Tooltip } from "@nexus/ui/nexus";
import { NexusLogo } from "./NexusLogo.js";
import { SearchBox } from "./SearchBox.js";
import { AppSwitcher } from "./AppSwitcher.js";
import { DateSelector } from "./DateSelector.js";

export function TopBar({
  nodeCount,
  onSearchSelect,
  onNotifications,
}: {
  nodeCount: number;
  onSearchSelect: (id: string) => void;
  onNotifications: () => void;
}) {
  return (
    <header className="flex items-center gap-3 border-b border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-1))] px-3 py-2">
      <AppSwitcher />
      <div className="flex shrink-0 items-center gap-2">
        <NexusLogo size={24} />
        <div className="leading-none">
          <span className="text-sm font-semibold tracking-tight text-[hsl(var(--nx-fg))]">Nexus</span>
          <span className="ml-1 text-sm font-light tracking-tight text-[hsl(var(--nx-fg-muted))]">Threat Explorer</span>
        </div>
        <span className="ml-1 hidden rounded bg-[hsl(var(--nx-surface-3))] px-1.5 py-0.5 text-[10px] text-[hsl(var(--nx-fg-muted))] sm:inline">
          {nodeCount} nodes
        </span>
      </div>

      <div className="flex flex-1 justify-center">
        <SearchBox onSelect={onSearchSelect} />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden md:block">
          <DateSelector />
        </div>
        <IconButton name="notifications" label="Notifications" badge onClick={onNotifications} />
        <IconButton name="help" label="Help" />
        <IconButton name="account_circle" label="Account" />
      </div>
    </header>
  );
}

function IconButton({ name, label, badge, onClick }: { name: string; label: string; badge?: boolean; onClick?: () => void }) {
  return (
    <Tooltip label={label} side="bottom">
      <button
        onClick={onClick}
        aria-label={label}
        className="relative grid h-9 w-9 place-items-center rounded-full text-[hsl(var(--nx-fg-muted))] hover:bg-[hsl(var(--nx-surface-3))] hover:text-[hsl(var(--nx-fg))]"
      >
        <Icon name={name} size={20} />
        {badge && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-[hsl(var(--nx-surface-1))] bg-[hsl(var(--severity-malicious))]" />
        )}
      </button>
    </Tooltip>
  );
}
