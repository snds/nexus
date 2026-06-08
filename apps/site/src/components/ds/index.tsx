/**
 * Dogfood helpers for the DS docs — token swatches (read live from the cascade) and a
 * component "specimen" frame. Used inside MDX. Styled with the DS tokens + Tailwind so the
 * docs are built with the system they document.
 */
import React, { useEffect, useState, type ReactNode } from "react";
import { Pill, Button } from "@nexus/ui/nexus";

function val(name: string) {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const STORYBOOK = "/nexus/storybook/";

type Status = "stable" | "beta" | "deprecated";

/** Maturity badge — dogfoods the Pill primitive. */
export function StatusBadge({ status }: { status: Status }) {
  const tone = status === "stable" ? "accent" : "neutral";
  return <Pill tone={tone as "accent" | "neutral"}>{status}</Pill>;
}

/**
 * Component page header — purpose line, maturity badge, and the deep-links every
 * component page in the canonical template must carry (Storybook, source).
 */
export function ComponentMeta({
  status = "stable",
  summary,
  storybook,
  source,
}: {
  status?: Status;
  summary: string;
  storybook?: string;
  source?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 16,
        padding: "16px 20px",
        margin: "8px 0 24px",
        borderRadius: 12,
        border: "1px solid var(--nx-border)",
        background: "var(--nx-surface-1)",
      }}
    >
      <StatusBadge status={status} />
      <span style={{ flex: 1, minWidth: 220, color: "var(--nx-fg-muted)", fontSize: 14 }}>{summary}</span>
      <div style={{ display: "flex", gap: 8 }}>
        {storybook ? (
          <a href={STORYBOOK + storybook} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <Button>Open in Storybook</Button>
          </a>
        ) : null}
        {source ? (
          <a href={source} style={{ alignSelf: "center", fontSize: 13, color: "var(--nx-fg-subtle)", fontFamily: "var(--nx-font-mono)" }}>
            {source.replace(/^.*\/src\//, "src/")}
          </a>
        ) : null}
      </div>
    </div>
  );
}

/** "Open in Storybook" inline link for variant/state sections. */
export function OpenInStorybook({ path, children }: { path: string; children?: ReactNode }) {
  return (
    <a href={STORYBOOK + path} target="_blank" rel="noreferrer">
      {children ?? "Open in Storybook →"}
    </a>
  );
}

type PropRow = { name: string; type: string; default?: string; description: string };

/** Props table for the API section. The full generated table lives in Storybook autodocs. */
export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <table>
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name}>
            <td><code>{r.name}</code></td>
            <td><code style={{ whiteSpace: "pre-wrap" }}>{r.type}</code></td>
            <td>{r.default ? <code>{r.default}</code> : "—"}</td>
            <td>{r.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Swatch({ name, label, kind = "fill" }: { name: string; label: string; kind?: "fill" | "border" | "text" }) {
  const [v, setV] = useState("");
  useEffect(() => setV(val(name)), [name]);
  return (
    <div className="tw-flex tw-items-center tw-gap-3" style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {kind === "text" ? (
        <span style={{ display: "grid", placeItems: "center", height: 40, width: 40, flexShrink: 0, borderRadius: 8, border: "1px solid var(--nx-border)", background: "var(--nx-bg)", color: `var(${name})`, fontWeight: 700 }}>Aa</span>
      ) : (
        <span style={kind === "border" ? { height: 40, width: 40, flexShrink: 0, borderRadius: 8, border: `3px solid var(${name})`, background: "var(--nx-surface-2)" } : { height: 40, width: 40, flexShrink: 0, borderRadius: 8, background: `var(${name})`, boxShadow: "inset 0 0 0 1px var(--nx-border)" }} />
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--nx-fg)" }}>{label}</div>
        <div style={{ fontFamily: "var(--nx-font-mono)", fontSize: 10, color: "var(--nx-fg-subtle)" }}>{name}</div>
        <div style={{ fontFamily: "var(--nx-font-mono)", fontSize: 10, color: "var(--nx-fg-subtle)" }}>{v || "—"}</div>
      </div>
    </div>
  );
}

export function SwatchGrid({ tokens, kind }: { tokens: [string, string][]; kind?: "fill" | "border" | "text" }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, margin: "16px 0" }}>
      {tokens.map(([n, l]) => <Swatch key={n} name={n} label={l} {...(kind ? { kind } : {})} />)}
    </div>
  );
}

export function Ramp({ prefix }: { prefix: string }) {
  const [, force] = useState(0);
  useEffect(() => force((n) => n + 1), []);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "12px 0" }}>
      {Array.from({ length: 12 }, (_, i) => i + 1).map((i) => {
        const name = `${prefix}-${i}`;
        return (
          <div key={i} style={{ width: 64 }}>
            <div style={{ height: 44, borderRadius: 8, background: `var(${name})`, boxShadow: "inset 0 0 0 1px var(--nx-border)" }} />
            <div style={{ fontFamily: "var(--nx-font-mono)", fontSize: 10, color: "var(--nx-fg-subtle)", marginTop: 4 }}>{i}</div>
            <div style={{ fontFamily: "var(--nx-font-mono)", fontSize: 9, color: "var(--nx-fg-subtle)" }}>{val(name) || "—"}</div>
          </div>
        );
      })}
    </div>
  );
}

export function Specimen({ children, padded = true }: { children: ReactNode; padded?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 24,
        padding: padded ? 28 : 12,
        margin: "16px 0",
        borderRadius: 12,
        border: "1px solid var(--nx-border)",
        background: "var(--nx-bg)",
      }}
    >
      {children}
    </div>
  );
}
