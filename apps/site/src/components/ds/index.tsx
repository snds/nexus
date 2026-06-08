/**
 * Dogfood helpers for the DS docs — token swatches (read live from the cascade) and a
 * component "specimen" frame. Used inside MDX. Styled with the DS tokens + Tailwind so the
 * docs are built with the system they document.
 */
import React, { useEffect, useState, type ReactNode } from "react";

function val(name: string) {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function Swatch({ name, label, kind = "fill" }: { name: string; label: string; kind?: "fill" | "border" | "text" }) {
  const [v, setV] = useState("");
  useEffect(() => setV(val(name)), [name]);
  return (
    <div className="tw-flex tw-items-center tw-gap-3" style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {kind === "text" ? (
        <span style={{ display: "grid", placeItems: "center", height: 40, width: 40, flexShrink: 0, borderRadius: 8, border: "1px solid hsl(var(--nx-border))", background: "hsl(var(--nx-bg))", color: `hsl(var(${name}))`, fontWeight: 700 }}>Aa</span>
      ) : (
        <span style={kind === "border" ? { height: 40, width: 40, flexShrink: 0, borderRadius: 8, border: `3px solid hsl(var(${name}))`, background: "hsl(var(--nx-surface-2))" } : { height: 40, width: 40, flexShrink: 0, borderRadius: 8, background: `hsl(var(${name}))`, boxShadow: "inset 0 0 0 1px hsl(var(--nx-border))" }} />
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "hsl(var(--nx-fg))" }}>{label}</div>
        <div style={{ fontFamily: "var(--nx-font-mono)", fontSize: 10, color: "hsl(var(--nx-fg-subtle))" }}>{name}</div>
        <div style={{ fontFamily: "var(--nx-font-mono)", fontSize: 10, color: "hsl(var(--nx-fg-subtle))" }}>{v || "—"}</div>
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
            <div style={{ height: 44, borderRadius: 8, background: `hsl(var(${name}))`, boxShadow: "inset 0 0 0 1px hsl(var(--nx-border))" }} />
            <div style={{ fontFamily: "var(--nx-font-mono)", fontSize: 10, color: "hsl(var(--nx-fg-subtle))", marginTop: 4 }}>{i}</div>
            <div style={{ fontFamily: "var(--nx-font-mono)", fontSize: 9, color: "hsl(var(--nx-fg-subtle))" }}>{val(name) || "—"}</div>
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
        border: "1px solid hsl(var(--nx-border))",
        background: "hsl(var(--nx-bg))",
      }}
    >
      {children}
    </div>
  );
}
