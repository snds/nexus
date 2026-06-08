/**
 * Full detail page — the "View full details →" destination. Replicates the per-type
 * detail screens: header (entity + verdict + range), a Summary card, a Graph-View mini,
 * and tabs of LINKED ENTITIES by type (count badges) over a data table, plus an Activity
 * tab. Linked rows are synthesized dummy data scaled per type.
 */
import { useMemo, useState } from "react";
import { ENTITY_META, type Entity, type EntityType, type Verdict } from "@nexus/domain";
import { EntityIcon, Icon, VerdictBadge, Tooltip } from "@nexus/ui/nexus";
import { GraphThumbnail } from "./GraphThumbnail.js";

function plural(label: string): string {
  if (label === "Malware") return label;
  if (/(s|x|z|ch|sh)$/i.test(label)) return `${label}es`;
  if (/[^aeiou]y$/i.test(label)) return `${label.slice(0, -1)}ies`;
  return `${label}s`;
}

const VERDICT_CYCLE: Verdict[] = ["malicious", "phishing", "suspicious", "malicious", "medium"];
const CLASSIFICATIONS = ["Phishing", "Malware", "C2", "Spam", "Credential Theft"];

const NAME_FOR: Partial<Record<EntityType, (i: number) => string>> = {
  url: (i) => `hxxp://malspam-${i + 1}.theguloen[.]com/bdl/gate.php`,
  domain: (i) => `infra-${i + 1}.theguloen.com`,
  ip: (i) => `204.11.${50 + i}.${10 + i * 3}`,
  hostname: (i) => `host${i + 1}.theguloen.com`,
  filename: (i) => `Invoice_${4400 + i}.doc`,
  hash: (i) => `a18ca4${i}00…b${1200 + i}`,
  campaign: (i) => `O365 Excel-Online Phishing — wave ${i + 1}`,
  malware: (i) => ["Zloader", "The Trick", "IcedID", "QakBot"][i % 4]!,
  actor: (i) => ["TA511", "TA505", "TA570", "TA577"][i % 4]!,
  exploit: () => "CVE-2021-40444 · MSHTML",
  sid: (i) => `ETPRO MALWARE Zloader CnC (${2034567 + i})`,
  email_address: (i) => `user${i + 1}@acme.com`,
  prs_message: (i) => `Subject: Your Invoice #${4400 + i}`,
  scan: (i) => `Sandbox scan #${i + 1}`,
};

interface LinkedRow {
  name: string;
  firstSeen: string;
  lastSeen: string;
  verdict: Verdict;
  users: number;
  classification: string;
}

/** Deterministic synthetic count for a linked type, so tables look populated. */
function linkedCount(type: EntityType, entityId: string): number {
  const h = (type.length * 7 + entityId.length * 3) % 22;
  return 6 + h; // 6–27
}

function linkedRows(type: EntityType, count: number): LinkedRow[] {
  const name = NAME_FOR[type] ?? ((i: number) => `${ENTITY_META[type].label} ${i + 1}`);
  return Array.from({ length: count }, (_, i) => ({
    name: name(i),
    firstSeen: `2026-05-${String(8 + (i % 20)).padStart(2, "0")}`,
    lastSeen: `2026-06-${String(1 + (i % 4)).padStart(2, "0")}`,
    verdict: VERDICT_CYCLE[i % VERDICT_CYCLE.length]!,
    users: (i * 7) % 38,
    classification: CLASSIFICATIONS[i % CLASSIFICATIONS.length]!,
  }));
}

export function DetailPage({
  entity,
  onBack,
  onOpenOnGraph,
}: {
  entity: Entity;
  onBack: () => void;
  onOpenOnGraph: (id: string) => void;
}) {
  const meta = ENTITY_META[entity.type];
  const [showDesc, setShowDesc] = useState(false);

  // Tabs: linked entity types present, then Activity.
  const linkTypes = useMemo(
    () => (entity.neighborCounts ? (Object.keys(entity.neighborCounts) as EntityType[]) : []),
    [entity],
  );
  const tabs: { key: string; label: string; count?: number }[] = [
    ...linkTypes.map((t) => ({ key: t, label: plural(ENTITY_META[t].label), count: linkedCount(t, entity.id) })),
    { key: "activity", label: "Activity" },
  ];
  const [tab, setTab] = useState<string>(tabs[0]?.key ?? "activity");
  const activeType = linkTypes.includes(tab as EntityType) ? (tab as EntityType) : null;
  const rows = activeType ? linkedRows(activeType, linkedCount(activeType, entity.id)) : [];
  const attrs = entity.attrs ? Object.entries(entity.attrs) : [];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[var(--nx-bg)]">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-[var(--nx-border)] px-5 py-3">
        <Tooltip label="Back to graph" side="bottom">
          <button onClick={onBack} aria-label="Back to graph" className="grid h-8 w-8 place-items-center rounded text-[var(--nx-fg-muted)] hover:bg-[var(--nx-surface-3)] hover:text-[var(--nx-fg)]">
            <Icon name="arrow_back" size={20} />
          </button>
        </Tooltip>
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border-2"
          style={{ borderColor: `var(--entity-${meta.colorToken})`, background: "var(--nx-surface-2)" }}
        >
          <EntityIcon type={entity.type} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-[var(--nx-fg)]" title={entity.label}>{entity.label}</p>
          <p className="text-[10px] uppercase tracking-wide text-[var(--nx-fg-subtle)]">{meta.label}</p>
        </div>
        <VerdictBadge verdict={entity.verdict} />
        {typeof entity.score === "number" && <span className="text-xs text-[var(--nx-fg-muted)]">score {entity.score}</span>}
        <span className="ml-2 flex items-center gap-1 rounded border border-[var(--nx-border)] px-2 py-1 text-[11px] text-[var(--nx-fg-muted)]">
          <Icon name="calendar_today" size={13} /> Last 7 days
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* summary + graph view */}
        <div className="grid gap-4 p-5 lg:grid-cols-[1fr_360px]">
          <section className="rounded-lg border border-[var(--nx-border)] bg-[var(--nx-surface-1)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--nx-fg-subtle)]">Summary</h2>
              <button onClick={() => setShowDesc((v) => !v)} className="text-[11px] font-medium text-[var(--nx-accent)] hover:underline">
                {showDesc ? "Hide description" : "View description"}
              </button>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:grid-cols-3">
              {entity.firstSeen && <Field label="First Seen On" value={entity.firstSeen} />}
              {entity.lastSeen && <Field label="Last Seen On" value={entity.lastSeen} />}
              {typeof entity.usersAtRisk === "number" && <Field label="Users At Risk" value={String(entity.usersAtRisk)} />}
              {attrs.map(([k, v]) => <Field key={k} label={k} value={String(v)} />)}
            </dl>
            {showDesc && (
              <p className="mt-3 border-t border-[var(--nx-border)] pt-3 text-[11px] leading-relaxed text-[var(--nx-fg-muted)]">
                {entity.label} was observed in association with the {meta.label.toLowerCase()} activity tracked by this
                graph. Indicators below are derived from sandbox detonation, passive DNS, and customer-environment
                telemetry over the selected window.
              </p>
            )}
          </section>

          <section className="rounded-lg border border-[var(--nx-border)] bg-[var(--nx-surface-1)] p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--nx-fg-subtle)]">Graph View</h2>
              <button onClick={() => onOpenOnGraph(entity.id)} className="flex items-center gap-1 text-[11px] font-medium text-[var(--nx-accent)] hover:underline">
                Open on graph <Icon name="open_in_new" size={13} />
              </button>
            </div>
            <GraphThumbnail seed={entity.id.length + entity.label.length} className="h-28 w-full" />
            {entity.neighborCounts && (
              <div className="mt-3 grid grid-cols-3 gap-x-2 gap-y-2 border-t border-[var(--nx-border)] pt-3">
                {(Object.entries(entity.neighborCounts) as [EntityType, number][]).map(([t]) => {
                  const c = linkedCount(t, entity.id);
                  return (
                    <div key={t} className="flex items-center gap-1.5">
                      <EntityIcon type={t} size={13} />
                      <span className="text-sm font-bold tabular-nums text-[var(--nx-fg)]">{c}</span>
                      <span className="truncate text-[10px] text-[var(--nx-fg-subtle)]">{plural(ENTITY_META[t].label)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* tabs */}
        <div className="border-b border-[var(--nx-border)] px-5">
          <div role="tablist" className="flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={
                  "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide " +
                  (tab === t.key
                    ? "border-[var(--nx-accent)] text-[var(--nx-fg)]"
                    : "border-transparent text-[var(--nx-fg-subtle)] hover:text-[var(--nx-fg-muted)]")
                }
              >
                {t.label}
                {typeof t.count === "number" && (
                  <span className="rounded-full bg-[var(--nx-surface-3)] px-1.5 text-[10px] tabular-nums text-[var(--nx-fg-muted)]">{t.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* table / activity */}
        <div className="p-5">
          {activeType ? (
            <>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-[var(--nx-fg)]">
                <EntityIcon type={activeType} size={16} /> Linked {plural(ENTITY_META[activeType].label)}
                <span className="text-xs text-[var(--nx-fg-subtle)]">({rows.length})</span>
              </h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--nx-border)] text-left uppercase tracking-wide text-[10px] text-[var(--nx-fg-subtle)]">
                    <th className="py-2 font-medium">{ENTITY_META[activeType].label}</th>
                    <th className="py-2 font-medium">First Seen</th>
                    <th className="py-2 font-medium">Last Seen</th>
                    <th className="py-2 font-medium">Verdict</th>
                    <th className="py-2 font-medium">Users</th>
                    <th className="py-2 font-medium">Classification</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b border-[var(--nx-border)] hover:bg-[var(--nx-surface-1)]">
                      <td className="max-w-[280px] truncate py-2 font-medium text-[var(--nx-accent)]" title={r.name}>{r.name}</td>
                      <td className="py-2 text-[var(--nx-fg-muted)]">{r.firstSeen}</td>
                      <td className="py-2 text-[var(--nx-fg-muted)]">{r.lastSeen}</td>
                      <td className="py-2"><span style={{ color: `var(--severity-${r.verdict})` }} className="capitalize">{r.verdict}</span></td>
                      <td className="py-2 text-[var(--nx-fg-muted)]">{r.users}</td>
                      <td className="py-2 text-[var(--nx-fg-muted)]">{r.classification}</td>
                      <td className="py-2"><Icon name="open_in_new" size={14} className="text-[var(--nx-fg-subtle)]" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <ActivityTab entity={entity} />
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] uppercase tracking-wide text-[var(--nx-fg-subtle)]">{label}</dt>
      <dd className="truncate text-[var(--nx-fg-muted)]" title={value}>{value}</dd>
    </div>
  );
}

function ActivityTab({ entity }: { entity: Entity }) {
  const conns = Array.from({ length: 10 }, (_, i) => ({
    date: `2026-06-0${1 + (i % 4)} 1${i % 6}:${String(10 + i * 4).slice(0, 2)}`,
    proto: ["tcp", "udp", "tcp"][i % 3]!,
    src: `10.0.${i}.${20 + i}`,
    dst: `204.11.56.${40 + i}`,
    port: [443, 80, 8080][i % 3]!,
    up: 1200 + i * 137,
    down: 42000 + i * 980,
  }));
  return (
    <>
      <h3 className="mb-2 text-sm font-medium text-[var(--nx-fg)]">Connections</h3>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[var(--nx-border)] text-left uppercase tracking-wide text-[10px] text-[var(--nx-fg-subtle)]">
            <th className="py-2 font-medium">Date</th>
            <th className="py-2 font-medium">Protocol</th>
            <th className="py-2 font-medium">Source</th>
            <th className="py-2 font-medium">Destination</th>
            <th className="py-2 font-medium">Port</th>
            <th className="py-2 font-medium">Bytes ↑</th>
            <th className="py-2 font-medium">Bytes ↓</th>
          </tr>
        </thead>
        <tbody>
          {conns.map((c, i) => (
            <tr key={i} className="border-b border-[var(--nx-border)] hover:bg-[var(--nx-surface-1)]">
              <td className="py-2 text-[var(--nx-fg-muted)]">{c.date}</td>
              <td className="py-2 uppercase text-[var(--nx-fg-muted)]">{c.proto}</td>
              <td className="py-2 text-[var(--nx-fg-muted)]">{c.src}</td>
              <td className="py-2 text-[var(--nx-fg-muted)]">{c.dst}</td>
              <td className="py-2 text-[var(--nx-fg-muted)]">{c.port}</td>
              <td className="py-2 tabular-nums text-[var(--nx-fg-muted)]">{c.up.toLocaleString()}</td>
              <td className="py-2 tabular-nums text-[var(--nx-fg-muted)]">{c.down.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {entity.attrs && (
        <p className="mt-3 text-[11px] text-[var(--nx-fg-subtle)]">Sandbox detonation and passive telemetry for {entity.label}.</p>
      )}
    </>
  );
}
