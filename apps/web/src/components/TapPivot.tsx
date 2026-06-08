/**
 * TAP pivot — a figurative "View in TAP" destination. Renders a Targeted Attack Protection
 * threat dashboard for an entity: network insights, attack spread, attack progression, and
 * intended / at-risk / impacted user tables. Pivots back to the Nexus graph.
 */
import type { ReactNode } from "react";
import { ENTITY_META, type Entity } from "@nexus/domain";
import { Icon, Tooltip } from "@nexus/ui/nexus";
import { GraphThumbnail } from "./GraphThumbnail.js";

function seeded(entity: Entity, salt: number) {
  return (entity.id.length * 13 + entity.label.length * 7 + salt * 31) % 100;
}

const USER_POOL = [
  "sales-costarica@akamai.com",
  "nfaris@akamai.com",
  "geturner@akamai.com",
  "lfalcone@akamai.com",
  "nbrown@akamai.com",
  "rcastle@acme.com",
];

export function TapPivot({ entity, onBack }: { entity: Entity; onBack: () => void }) {
  const meta = ENTITY_META[entity.type];
  const intended = 3 + (seeded(entity, 1) % 6);
  const atRisk = 1 + (seeded(entity, 2) % 3);
  const impacted = seeded(entity, 3) % 3;
  const blocked = seeded(entity, 4) % 8;
  const delivered = 6 + (seeded(entity, 5) % 14);
  const spreadPct = 20 + (seeded(entity, 6) % 75);

  const users = (n: number, salt: number) =>
    Array.from({ length: n }, (_, i) => USER_POOL[(seeded(entity, salt) + i) % USER_POOL.length]!);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[hsl(var(--nx-bg))]">
      {/* TAP app bar */}
      <div className="flex items-center gap-3 border-b border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-1))] px-4 py-2.5">
        <Tooltip label="Back to Nexus" side="bottom">
          <button onClick={onBack} aria-label="Back to Nexus" className="grid h-8 w-8 place-items-center rounded text-[hsl(var(--nx-fg-muted))] hover:bg-[hsl(var(--nx-surface-3))] hover:text-[hsl(var(--nx-fg))]">
            <Icon name="arrow_back" size={20} />
          </button>
        </Tooltip>
        <Icon name="security" size={22} className="text-[hsl(var(--nx-accent))]" />
        <span className="text-sm font-semibold text-[hsl(var(--nx-fg))]">Targeted Attack Protection</span>
        <span className="ml-2 rounded bg-[hsl(var(--nx-surface-3))] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[hsl(var(--nx-fg-muted))]">Pivoted from Nexus</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-5xl">
          {/* threat header */}
          <div className="rounded-lg border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-1))] p-4 text-center">
            <p className="truncate text-base font-semibold text-[hsl(var(--nx-fg))]" title={entity.label}>{entity.label}</p>
            <p className="mt-0.5 text-xs text-[hsl(var(--nx-fg-subtle))]">
              {delivered + blocked} Messages · 160 Customers · {impacted} Users Impacted · {meta.label}
            </p>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {/* network insights */}
            <Card title="NTX Insights" link="Explore">
              <div className="flex items-center gap-3 py-1.5">
                <Icon name="mail" size={20} className="text-[hsl(var(--nx-accent))]" />
                <span className="text-lg font-bold tabular-nums text-[hsl(var(--nx-fg))]">{intended + atRisk}</span>
                <span className="text-xs text-[hsl(var(--nx-fg-muted))]">users received email message threats</span>
              </div>
              <div className="flex items-center gap-3 py-1.5">
                <Icon name="document_scanner" size={20} className="text-[hsl(var(--severity-malicious))]" />
                <span className="text-lg font-bold tabular-nums text-[hsl(var(--nx-fg))]">{4 + (seeded(entity, 7) % 12)}</span>
                <span className="text-xs text-[hsl(var(--nx-fg-muted))]">detailed forensic scans available</span>
              </div>
            </Card>

            {/* mini graph */}
            <Card title="Threat Graph">
              <GraphThumbnail seed={entity.label.length + 3} className="h-28 w-full" />
            </Card>

            {/* attack spread — bucketed graded scale (matches TAP reference): Targeted →
                Widespread, with the active customer-count bucket called out. */}
            <Card title="Attack Spread" link="View Statistics">
              {(() => {
                const BUCKETS = ["2", "3–5", "6", "10+", "20+", "30+", "40+", "100", "150+"];
                const UPPER = [2, 5, 6, 10, 20, 30, 40, 100, 150];
                const count = spreadPct >= 90 ? 150 : spreadPct;
                const active = Math.max(0, UPPER.findIndex((u) => count <= u));
                const colorFor = (i: number) =>
                  i < 3 ? "var(--severity-malicious)" : i < 6 ? "var(--severity-suspicious)" : "var(--severity-medium)";
                return (
                  <>
                    <div className="flex items-end gap-0.5">
                      {BUCKETS.map((b, i) => (
                        <div key={b} className="flex flex-1 flex-col items-center gap-1">
                          <span className={"text-[9px] tabular-nums " + (i === active ? "font-bold text-[hsl(var(--nx-fg))]" : "text-[hsl(var(--nx-fg-subtle))]")}>{b}</span>
                          <div
                            className={"h-2.5 w-full first:rounded-l-full last:rounded-r-full " + (i === active ? "ring-2 ring-[hsl(var(--nx-fg)/0.5)]" : "")}
                            style={{ background: `hsl(${colorFor(i)})`, opacity: i === active ? 1 : 0.4 }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-1.5 flex justify-between text-[10px] text-[hsl(var(--nx-fg-subtle))]">
                      <span>Targeted</span>
                      <span className="font-semibold text-[hsl(var(--nx-fg))]">Seen by {BUCKETS[active]} customers</span>
                      <span>Widespread</span>
                    </div>
                  </>
                );
              })()}
            </Card>

            {/* attack progression */}
            <Card title="Attack Progression" link="View Details">
              <Row label="Messages" a={`${blocked} Blocked`} b={`${delivered} Delivered`} />
              <Row label="Delivered" a="0 Rewritten" b={`${delivered} Non-rewritten`} warn />
              <Row label="Clicks" a="0 Blocked" b={`${impacted} Permitted`} />
            </Card>
          </div>

          {/* user tables */}
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <UserTable title={`Intended Users (${intended})`} note="All activity related to this threat in your traffic." users={users(intended, 8)} col="Messages Seen" />
            <UserTable title={`At Risk Users (${atRisk})`} note="Users who could be exposed if they open it." users={users(atRisk, 9)} col="Delivered" />
            <UserTable title={`Impacted Users (${impacted})`} note="Users whose clicks were permitted." users={users(impacted, 10)} col="Clicks" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, link, children }: { title: string; link?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-1))] p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--nx-fg-subtle))]">{title}</h3>
        {link && <span className="flex items-center gap-0.5 text-[11px] font-medium text-[hsl(var(--nx-accent))]">{link} <Icon name="chevron_right" size={14} /></span>}
      </div>
      {children}
    </section>
  );
}

function Row({ label, a, b, warn }: { label: string; a: string; b: string; warn?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-[hsl(var(--nx-border))] py-1.5 text-xs last:border-0">
      <span className="text-[hsl(var(--nx-fg-subtle))]">{label}</span>
      <span className="flex gap-4">
        <span className="text-[hsl(var(--nx-fg-muted))]">{a}</span>
        <span className={warn ? "font-semibold text-[hsl(var(--severity-suspicious))]" : "text-[hsl(var(--nx-fg-muted))]"}>{b}</span>
      </span>
    </div>
  );
}

function UserTable({ title, note, users, col }: { title: string; note: string; users: string[]; col: string }) {
  return (
    <section className="rounded-lg border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-1))] p-4">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[hsl(var(--nx-fg))]">{title}</h3>
        <span className="flex items-center gap-0.5 text-[11px] font-medium text-[hsl(var(--nx-accent))]">Show more <Icon name="chevron_right" size={13} /></span>
      </div>
      <p className="mb-2 text-[11px] text-[hsl(var(--nx-fg-subtle))]">{note}</p>
      {users.length === 0 ? (
        <p className="py-3 text-center text-[11px] text-[hsl(var(--nx-fg-subtle))]">No users.</p>
      ) : (
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-[hsl(var(--nx-border))] text-left text-[hsl(var(--nx-fg-subtle))]">
              <th className="py-1 font-medium">User</th>
              <th className="py-1 text-right font-medium">{col}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i} className="border-b border-[hsl(var(--nx-border))] last:border-0">
                <td className="truncate py-1 text-[hsl(var(--nx-accent))]">{u}</td>
                <td className="py-1 text-right tabular-nums text-[hsl(var(--nx-fg-muted))]">{1 + (i % 3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
