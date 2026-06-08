/** Foundations/Tokens — the design tokens (read live from :root) that every component and
 *  surface consumes. The single source of truth in @nexus/tokens. */
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = { title: "Foundations/Tokens" };
export default meta;
type Story = StoryObj;

function val(name: string) {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function Swatch({ name, label, kind = "fill" }: { name: string; label: string; kind?: "fill" | "border" | "text" }) {
  return (
    <div className="flex items-center gap-3">
      {kind === "text" ? (
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-bg))] text-lg font-bold" style={{ color: `hsl(var(${name}))` }}>Aa</span>
      ) : (
        <span className="h-10 w-10 shrink-0 rounded-md" style={kind === "border" ? { border: `3px solid hsl(var(${name}))`, background: "hsl(var(--nx-surface-2))" } : { background: `hsl(var(${name}))`, boxShadow: "inset 0 0 0 1px hsl(var(--nx-border))" }} />
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-[hsl(var(--nx-fg))]">{label}</p>
        <p className="truncate font-mono text-[10px] text-[hsl(var(--nx-fg-subtle))]">{name}</p>
        <p className="truncate font-mono text-[10px] text-[hsl(var(--nx-fg-subtle))]">{val(name) || "—"}</p>
      </div>
    </div>
  );
}

function Grid({ items, kind }: { items: [string, string][]; kind?: "fill" | "border" | "text" }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {items.map(([n, l]) => <Swatch key={n} name={n} label={l} {...(kind ? { kind } : {})} />)}
    </div>
  );
}

function H({ children }: { children: string }) {
  return <h3 className="mb-3 mt-7 text-sm font-semibold text-[hsl(var(--nx-fg))] first:mt-0">{children}</h3>;
}

const ENTITY = "actor,campaign,malware,exploit,sid,hash,url,domain,ip,hostname,filename,email,message,scan".split(",").map((k) => [`--entity-${k}`, k] as [string, string]);
const SEVERITY = ["malicious", "phishing", "suspicious", "medium", "benign", "unknown"].map((v) => [`--severity-${v}`, v] as [string, string]);

export const Colors: Story = {
  render: () => (
    <div className="max-w-4xl text-[hsl(var(--nx-fg))]">
      <H>Background contexts</H>
      <Grid items={[["--nx-bg", "App / canvas"], ["--nx-surface-1", "Panels"], ["--nx-surface-2", "Raised"], ["--nx-surface-3", "Hover"]]} />
      <H>Borders & accent</H>
      <Grid kind="border" items={[["--nx-border", "Border"], ["--nx-border-strong", "Strong"], ["--nx-accent", "Accent"], ["--nx-ring", "Ring"]]} />
      <H>Text</H>
      <Grid kind="text" items={[["--nx-fg", "Primary"], ["--nx-fg-muted", "Muted"], ["--nx-fg-subtle", "Subtle"]]} />
      <H>Entity color (channel — type)</H>
      <Grid items={ENTITY} />
      <H>Severity (own channel — verdict)</H>
      <Grid items={SEVERITY} />
    </div>
  ),
};

export const RadiusAndMotion: Story = {
  name: "Radius & motion",
  render: () => (
    <div className="max-w-3xl text-[hsl(var(--nx-fg))]">
      <H>Radius</H>
      <div className="flex flex-wrap gap-6">
        {([["--nx-radius-sm", "sm"], ["--nx-radius", "base"], ["--nx-radius-lg", "lg"]] as [string, string][]).map(([n, l]) => (
          <div key={n} className="text-center">
            <div className="h-16 w-16 border-2 border-[hsl(var(--nx-border-strong))] bg-[hsl(var(--nx-surface-2))]" style={{ borderRadius: `var(${n})` }} />
            <p className="mt-2 text-xs">{l}</p>
            <p className="font-mono text-[10px] text-[hsl(var(--nx-fg-subtle))]">{n}</p>
          </div>
        ))}
      </div>
      <H>Motion</H>
      <div className="grid grid-cols-3 gap-3">
        {([["--nx-motion-fast", "micro"], ["--nx-motion-base", "state"], ["--nx-motion-slow", "large"]] as [string, string][]).map(([n, l]) => (
          <div key={n} className="rounded-md border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-1))] p-3">
            <p className="font-mono text-xs">{val(n) || "—"}</p>
            <p className="text-[11px] text-[hsl(var(--nx-fg-muted))]">{l}</p>
            <p className="font-mono text-[10px] text-[hsl(var(--nx-fg-subtle))]">{n}</p>
          </div>
        ))}
      </div>
    </div>
  ),
};
