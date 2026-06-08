/**
 * User-node Summary panel — replicates the "User-Centric Graph · Panel Expanded" design:
 * identity header, org context, email addresses, active cloud-service pills, the
 * DLP / Suspicious-Logins / Phishing risk stat circles, and a similar-users table.
 */
import type { ReactNode } from "react";
import type { UserProfile } from "@nexus/domain";
import { Icon, Pill, StatCircle } from "@nexus/ui/nexus";

export function UserSummary({ profile }: { profile: UserProfile }) {
  const stats = profile.stats;
  return (
    <div className="flex flex-col">
      {/* identity */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white"
          style={{ background: "var(--entity-sid)" }}
        >
          <Icon name="person" size={24} filled />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--nx-fg)]">{profile.displayName}</p>
          {profile.title && <p className="truncate text-xs text-[var(--nx-fg-muted)]">{profile.title}</p>}
        </div>
      </div>

      {/* org context */}
      <div className="grid grid-cols-3 gap-2 px-4 pb-1">
        <Field label="Company" value={profile.company} />
        <Field label="Department" value={profile.department} />
        <Field label="Location" value={profile.location} warn={profile.atRisk} />
      </div>

      {profile.emails && profile.emails.length > 0 && (
        <Block title={`Email Addresses (${profile.emails.length})`}>
          <ul className="flex flex-col gap-0.5">
            {profile.emails.map((e, i) => (
              <li key={e} className="flex items-center gap-1.5 text-[11px] text-[var(--nx-fg-muted)]">
                {i === 0 && <span className="text-[9px] uppercase text-[var(--nx-fg-subtle)]">primary</span>}
                {e}
              </li>
            ))}
          </ul>
        </Block>
      )}

      {profile.cloudServices && profile.cloudServices.length > 0 && (
        <Block title="Active Cloud Services">
          <div className="flex flex-wrap gap-1.5">
            {profile.cloudServices.map((s) => (
              <Pill key={s}>{s}</Pill>
            ))}
          </div>
        </Block>
      )}

      {stats && (
        <Block>
          <div className="grid grid-cols-3 gap-2">
            <StatCircle value={stats.dlpViolations} label="DLP Violations" tone="benign" />
            <StatCircle value={stats.suspiciousLogins} label="Suspicious Logins" tone="suspicious" />
            <StatCircle value={stats.phishingAttempts} label="Phishing Attempts" tone="malicious" />
          </div>
        </Block>
      )}

      {profile.similarUsers && profile.similarUsers.length > 0 && (
        <Block title={`Similar Users (${profile.similarUsers.length})`}>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-left text-[var(--nx-fg-subtle)]">
                <th className="pb-1 font-medium">Name</th>
                <th className="pb-1 font-medium">Email</th>
              </tr>
            </thead>
            <tbody>
              {profile.similarUsers.map((u) => (
                <tr key={u.email} className="border-t border-[var(--nx-border)]">
                  <td className="flex items-center gap-1.5 py-1 text-[var(--nx-fg-muted)]">
                    <Icon name="person" size={13} className="text-[var(--nx-fg-subtle)]" />
                    {u.name}
                  </td>
                  <td className="truncate py-1 text-[var(--nx-fg-subtle)]">{u.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Block>
      )}
    </div>
  );
}

function Field({ label, value, warn }: { label: string; value?: string | undefined; warn?: boolean | undefined }) {
  if (!value) return null;
  return (
    <div className="min-w-0">
      <p className="text-[9px] uppercase tracking-wide text-[var(--nx-fg-subtle)]">{label}</p>
      <p className="flex items-center gap-1 truncate text-[11px] text-[var(--nx-fg-muted)]" title={value}>
        {warn && <Icon name="warning" size={12} className="text-[var(--severity-suspicious)]" />}
        {value}
      </p>
    </div>
  );
}

function Block({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="border-t border-[var(--nx-border)] p-4">
      {title && <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--nx-fg-subtle)]">{title}</h3>}
      {children}
    </div>
  );
}
