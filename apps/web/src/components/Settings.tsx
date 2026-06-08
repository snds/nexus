/**
 * Settings — sub-navigated page (Privileges · Connected Applications · VIP Settings),
 * reachable from the nav rail. Connected Applications hosts the Splunk setup wizard
 * (3-step stepper). VIP Settings toggles the TAP VIP integration. Figurative content.
 */
import { useState } from "react";
import { Icon, Stepper, Tooltip } from "@nexus/ui/nexus";

type Pane = "privileges" | "applications" | "vip";

export function Settings({
  splunkConnected,
  onSplunkConnect,
  vipEnabled,
  onToggleVip,
}: {
  splunkConnected: boolean;
  onSplunkConnect: () => void;
  vipEnabled: boolean;
  onToggleVip: (v: boolean) => void;
}) {
  const [pane, setPane] = useState<Pane>("privileges");
  const items: { key: Pane; label: string; icon: string }[] = [
    { key: "privileges", label: "Privileges", icon: "shield_person" },
    { key: "applications", label: "Connected Applications", icon: "extension" },
    { key: "vip", label: "VIP Settings", icon: "star" },
  ];

  return (
    <div className="flex h-full overflow-hidden bg-[hsl(var(--nx-bg))]">
      <aside className="w-60 shrink-0 border-r border-[hsl(var(--nx-border))] p-3">
        <h1 className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--nx-fg-subtle))]">Settings</h1>
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => setPane(it.key)}
            className={
              "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm " +
              (pane === it.key
                ? "bg-[hsl(var(--nx-accent)/0.14)] text-[hsl(var(--nx-accent))]"
                : "text-[hsl(var(--nx-fg-muted))] hover:bg-[hsl(var(--nx-surface-2))]")
            }
          >
            <Icon name={it.icon} size={18} filled={pane === it.key} />
            {it.label}
          </button>
        ))}
      </aside>

      <div className="min-w-0 flex-1 overflow-y-auto p-8">
        {pane === "privileges" && <Privileges />}
        {pane === "applications" && <ConnectedApplications connected={splunkConnected} onConnect={onSplunkConnect} />}
        {pane === "vip" && <VipSettings enabled={vipEnabled} onToggle={onToggleVip} />}
      </div>
    </div>
  );
}

/* ── Privileges ─────────────────────────────────────────────────────────────── */
const USERS = [
  { email: "john.smith@acme.com", role: "Account Admin" },
  { email: "r.castle@acme.com", role: "Investigator" },
  { email: "a.patel@acme.com", role: "Analyst" },
  { email: "m.okafor@acme.com", role: "Responder" },
  { email: "s.nilsson@acme.com", role: "Analyst" },
];

const CAPS = [
  { name: "View graphs", role: "Analyst", on: true },
  { name: "Save & share graphs", role: "Analyst", on: true },
  { name: "Run transforms", role: "Analyst", on: true },
  { name: "Run Splunk queries", role: "Investigator", on: true },
  { name: "Push to Threat Response (PTR)", role: "Responder", on: true },
  { name: "Manage integrations", role: "Admin", on: false },
  { name: "Manage VIP list", role: "Admin", on: false },
];

function Privileges() {
  return (
    <div className="max-w-2xl">
      {/* Primary: who has access (account-admin roster) — matches the reference's Privileges. */}
      <h2 className="text-lg font-semibold text-[hsl(var(--nx-fg))]">Privileges</h2>
      <p className="mt-1 text-xs text-[hsl(var(--nx-fg-muted))]">
        Account admins can change settings and always have access to the dashboard. No email is sent on a privilege change.
      </p>
      <table className="mt-5 w-full text-sm">
        <thead>
          <tr className="border-b border-[hsl(var(--nx-border))] text-left text-[10px] uppercase tracking-wide text-[hsl(var(--nx-fg-subtle))]">
            <th className="py-2 font-medium">User Email Address</th>
            <th className="py-2 font-medium">Role</th>
            <th className="w-12 py-2 text-right font-medium">Revoke</th>
          </tr>
        </thead>
        <tbody>
          {USERS.map((u) => (
            <tr key={u.email} className="border-b border-[hsl(var(--nx-border))]">
              <td className="py-2.5 text-[hsl(var(--nx-accent))]">{u.email}</td>
              <td className="py-2.5">
                <span className="inline-flex items-center gap-1 text-[hsl(var(--nx-fg-muted))]">
                  {u.role}
                  <Icon name="arrow_drop_down" size={20} className="text-[hsl(var(--nx-fg-subtle))]" />
                </span>
              </td>
              <td className="py-2.5 text-right">
                <Tooltip label="Revoke access" side="left">
                  <button aria-label={`Revoke access for ${u.email}`} className="grid h-7 w-7 place-items-center rounded text-[hsl(var(--nx-fg-subtle))] hover:bg-[hsl(var(--nx-surface-3))] hover:text-[hsl(var(--severity-malicious))]">
                    <Icon name="close" size={20} />
                  </button>
                </Tooltip>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--nx-accent))] hover:brightness-110">
        <Icon name="add_circle" size={20} />
        Add New User
      </button>

      {/* Secondary: what each role can do (capability matrix). */}
      <h3 className="mt-8 text-sm font-semibold text-[hsl(var(--nx-fg))]">Role capabilities</h3>
      <p className="mt-1 text-xs text-[hsl(var(--nx-fg-muted))]">What each role is permitted to do in Nexus.</p>
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b border-[hsl(var(--nx-border))] text-left text-[10px] uppercase tracking-wide text-[hsl(var(--nx-fg-subtle))]">
            <th className="py-2 font-medium">Capability</th>
            <th className="py-2 font-medium">Required Role</th>
            <th className="py-2 text-right font-medium">Granted</th>
          </tr>
        </thead>
        <tbody>
          {CAPS.map((c) => (
            <tr key={c.name} className="border-b border-[hsl(var(--nx-border))]">
              <td className="py-2.5 text-[hsl(var(--nx-fg))]">{c.name}</td>
              <td className="py-2.5 text-[hsl(var(--nx-fg-muted))]">{c.role}</td>
              <td className="py-2.5 text-right">
                <Icon
                  name={c.on ? "check_circle" : "cancel"}
                  filled={c.on}
                  size={20}
                  className={c.on ? "text-[hsl(var(--severity-benign))]" : "text-[hsl(var(--nx-fg-subtle))]"}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Connected Applications → Splunk wizard ─────────────────────────────────── */
function ConnectedApplications({ connected, onConnect }: { connected: boolean; onConnect: () => void }) {
  const [step, setStep] = useState(connected ? 2 : 0);
  const [searchHead, setSearchHead] = useState("");
  const valid = /^https?:\/\/.+:\d+/.test(searchHead.trim());

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold text-[hsl(var(--nx-fg))]">Splunk Integration</h2>
      <p className="mt-1 text-xs text-[hsl(var(--nx-fg-muted))]">
        Connect a Splunk instance to pull user click activity into the graph.
      </p>

      <div className="my-8">
        <Stepper steps={["Start", "Configure", "Finish"]} current={step} />
      </div>

      <div className="rounded-lg border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-1))] p-6">
        {step === 0 && (
          <div className="text-center">
            <Icon name="cloud_sync" size={40} className="text-[hsl(var(--nx-accent))]" />
            <p className="mt-2 text-sm font-medium text-[hsl(var(--nx-fg))]">Set up the Splunk connection</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-[hsl(var(--nx-fg-muted))]">
              You’ll provide your Search Head URL and authenticate. Credentials are passed to Splunk directly.
            </p>
            <button onClick={() => setStep(1)} className="mt-4 rounded-md bg-[hsl(var(--nx-accent))] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--nx-accent-fg))] hover:brightness-110">
              Get started
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h3 className="text-sm font-medium text-[hsl(var(--nx-fg))]">Enter Splunk Configuration</h3>
            <p className="mt-1 text-xs text-[hsl(var(--nx-fg-muted))]">To connect, provide your Search Head.</p>
            <input
              autoFocus
              value={searchHead}
              onChange={(e) => setSearchHead(e.target.value)}
              placeholder="Search Head"
              aria-label="Search Head"
              className="mt-4 w-full border-b border-[hsl(var(--nx-border-strong))] bg-transparent pb-1.5 text-sm text-[hsl(var(--nx-fg))] placeholder:text-[hsl(var(--nx-fg-subtle))] focus:border-[hsl(var(--nx-ring))] focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-[hsl(var(--nx-fg-subtle))]">Be sure to include the port. Example: https://splunk.acme.com:8089</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setStep(0)} className="rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--nx-fg-muted))] hover:bg-[hsl(var(--nx-surface-3))]">Back</button>
              <button
                disabled={!valid}
                onClick={() => { onConnect(); setStep(2); }}
                className={"rounded-md px-4 py-1.5 text-xs font-semibold uppercase tracking-wide " + (valid ? "bg-[hsl(var(--nx-accent))] text-[hsl(var(--nx-accent-fg))] hover:brightness-110" : "cursor-not-allowed bg-[hsl(var(--nx-surface-3))] text-[hsl(var(--nx-fg-subtle))]")}
              >
                Connect to instance
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <span className="grid h-12 w-12 mx-auto place-items-center rounded-full bg-[hsl(var(--severity-benign)/0.15)]">
              <Icon name="check_circle" size={28} filled className="text-[hsl(var(--severity-benign))]" />
            </span>
            <p className="mt-2 text-sm font-medium text-[hsl(var(--nx-fg))]">Splunk connected</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-[hsl(var(--nx-fg-muted))]">
              User-click queries are now available from any recipient node’s context menu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── VIP Settings ──────────────────────────────────────────────────────────── */
function VipSettings({ enabled, onToggle }: { enabled: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold text-[hsl(var(--nx-fg))]">VIP Settings</h2>
      <p className="mt-1 text-xs text-[hsl(var(--nx-fg-muted))]">
        Highlight recipients on your TAP VIP list across the graph and detail panes. Edit the list in your TAP
        Dashboard; changes are reflected here.
      </p>
      <div className="mt-5 flex items-center justify-between rounded-lg border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-1))] p-4">
        <div className="flex items-center gap-3">
          <Icon name="star" filled={enabled} size={22} className={enabled ? "text-[hsl(var(--severity-medium))]" : "text-[hsl(var(--nx-fg-subtle))]"} />
          <div>
            <p className="text-sm font-medium text-[hsl(var(--nx-fg))]">VIP user highlighting</p>
            <p className="text-xs text-[hsl(var(--nx-fg-muted))]">{enabled ? "Enabled" : "Disabled"} · synced from TAP</p>
          </div>
        </div>
        <button
          role="switch"
          aria-checked={enabled}
          onClick={() => onToggle(!enabled)}
          className={"relative h-6 w-11 rounded-full transition-colors " + (enabled ? "bg-[hsl(var(--nx-accent))]" : "bg-[hsl(var(--nx-surface-3))]")}
        >
          <span className={"absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all " + (enabled ? "left-[22px]" : "left-0.5")} />
        </button>
      </div>
    </div>
  );
}
