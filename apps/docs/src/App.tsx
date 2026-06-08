/**
 * Nexus Design System — living documentation. This site DOGFOODS the system it documents:
 * every surface, border, and text color is a `--nx-*` token, and the component gallery
 * renders the REAL primitives from `@nexus/ui` (not screenshots). Token values are read
 * live from the cascade, so the docs can never drift from the source of truth.
 */
import { useEffect, useState, type ReactNode } from "react";
import { ENTITY_META, type EntityType, type Verdict } from "@nexus/domain";
import {
  Icon,
  ToolButton,
  Tooltip,
  EntityIcon,
  ENTITY_SYMBOL,
  ShapeIcon,
  VerdictBadge,
  VerdictPip,
  CountChip,
  StatCircle,
  Pill,
  StateBlock,
  Stepper,
  NodeBadge,
  GraphLegend,
} from "@nexus/ui/nexus";

const BASE = import.meta.env.BASE_URL;

// ── token groups (names only — values are read live) ────────────────────────────
const BACKGROUNDS: [string, string][] = [
  ["--nx-bg", "App / canvas · bg 1"],
  ["--nx-surface-1", "Panels / cards · bg 2"],
  ["--nx-surface-2", "Raised / popover"],
  ["--nx-surface-3", "Hover / selected"],
];
const LINES: [string, string][] = [
  ["--nx-border", "Border"],
  ["--nx-border-strong", "Border strong"],
];
const ACCENTS: [string, string][] = [
  ["--nx-accent", "Accent (interactive)"],
  ["--nx-ring", "Focus ring"],
];
const TEXTS: [string, string][] = [
  ["--nx-fg", "Primary text"],
  ["--nx-fg-muted", "Muted text"],
  ["--nx-fg-subtle", "Subtle text · ≥4.5:1 AA"],
];
const ENTITIES: [string, string][] = [
  "actor,campaign,malware,exploit,sid,hash,url,domain,ip,hostname,filename,email,message,scan"
    .split(","),
].flat().map((k) => [`--entity-${k}`, k]) as [string, string][];
const SEVERITIES: [string, string][] = (
  ["malicious", "phishing", "suspicious", "medium", "benign", "unknown"] as Verdict[]
).map((v) => [`--severity-${v}`, v]);
const MOTION: [string, string][] = [
  ["--nx-motion-fast", "micro-interactions"],
  ["--nx-motion-base", "state change / edge fade"],
  ["--nx-motion-slow", "larger elements"],
];
const RADII: [string, string][] = [
  ["--nx-radius-sm", "sm"],
  ["--nx-radius", "base"],
  ["--nx-radius-lg", "lg"],
];

// Sample entities for the node gallery.
const SAMPLE_TYPES: EntityType[] = ["actor", "campaign", "malware", "exploit", "email_address", "domain"];

function tokenValue(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// ── docs-local layout primitives (token-styled) ─────────────────────────────────
function Section({ id, title, kicker, children }: { id: string; title: string; kicker?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-[hsl(var(--nx-border))] py-12 first:border-t-0">
      {kicker && <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--nx-accent))]">{kicker}</p>}
      <h2 className="text-2xl font-semibold tracking-tight text-[hsl(var(--nx-fg))]">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={"rounded-lg border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-1))] " + className}>{children}</div>
  );
}

function Specimen({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 border-b border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-bg))] p-6">{children}</div>
      <div className="px-4 py-3">
        <p className="text-sm font-medium text-[hsl(var(--nx-fg))]">{title}</p>
        {note && <p className="mt-0.5 text-xs leading-relaxed text-[hsl(var(--nx-fg-muted))]">{note}</p>}
      </div>
    </Card>
  );
}

function Swatch({ name, label, kind = "fill" }: { name: string; label: string; kind?: "fill" | "border" | "text" }) {
  const [val, setVal] = useState("");
  useEffect(() => setVal(tokenValue(name)), [name]);
  return (
    <div className="flex items-center gap-3">
      {kind === "text" ? (
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-bg))] text-lg font-bold" style={{ color: `hsl(var(${name}))` }}>
          Aa
        </span>
      ) : (
        <span
          className="h-10 w-10 shrink-0 rounded-md"
          style={kind === "border" ? { border: `3px solid hsl(var(${name}))`, background: "hsl(var(--nx-surface-2))" } : { background: `hsl(var(${name}))`, boxShadow: "inset 0 0 0 1px hsl(var(--nx-border))" }}
        />
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-[hsl(var(--nx-fg))]">{label}</p>
        <p className="truncate font-mono text-[10px] text-[hsl(var(--nx-fg-subtle))]">{name}</p>
        <p className="truncate font-mono text-[10px] text-[hsl(var(--nx-fg-subtle))]">{val || "—"}</p>
      </div>
    </div>
  );
}

function SwatchGrid({ tokens, kind }: { tokens: [string, string][]; kind?: "fill" | "border" | "text" }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {tokens.map(([name, label]) => (
        <Swatch key={name} name={name} label={label} {...(kind ? { kind } : {})} />
      ))}
    </div>
  );
}

const NAV = [
  ["overview", "Overview"],
  ["foundations", "Foundations"],
  ["color", "· Color"],
  ["type", "· Typography"],
  ["radius-motion", "· Radius & motion"],
  ["components", "Components"],
  ["nodes", "The node system"],
  ["principles", "Principles"],
];

export function App() {
  return (
    <div className="mx-auto flex max-w-[1180px] gap-10 px-6">
      {/* side nav */}
      <aside className="sticky top-0 hidden h-screen w-52 shrink-0 flex-col gap-1 overflow-y-auto py-8 lg:flex">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[hsl(var(--nx-accent)/0.15)] text-[hsl(var(--nx-accent))]">
            <Icon name="hub" size={20} filled />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-[hsl(var(--nx-fg))]">Nexus DS</p>
            <p className="text-[10px] text-[hsl(var(--nx-fg-subtle))]">v0 · dark-first</p>
          </div>
        </div>
        {NAV.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="rounded-md px-2 py-1.5 text-xs text-[hsl(var(--nx-fg-muted))] transition-colors hover:bg-[hsl(var(--nx-surface-2))] hover:text-[hsl(var(--nx-fg))]">
            {label}
          </a>
        ))}
        <a href={`${BASE}app/`} className="mt-4 flex items-center gap-1.5 rounded-md bg-[hsl(var(--nx-accent))] px-2.5 py-2 text-xs font-semibold text-[hsl(var(--nx-accent-fg))] hover:brightness-110">
          <Icon name="open_in_new" size={16} /> Live demo
        </a>
        <a href="https://github.com/snds/nexus" className="flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs text-[hsl(var(--nx-fg-muted))] hover:text-[hsl(var(--nx-fg))]">
          <Icon name="code" size={16} /> Source
        </a>
      </aside>

      {/* content */}
      <main className="min-w-0 flex-1 pb-24">
        <Section id="overview" title="Nexus Design System" kicker="Living documentation">
          <p className="max-w-2xl text-sm leading-relaxed text-[hsl(var(--nx-fg-muted))]">
            The system behind Nexus Threat Explorer — a dark-first, token-driven library for SOC
            link-analysis surfaces. This page is built from the system itself: every color is a
            token read live from the cascade, and every example below is the real component, not a
            picture. Three orthogonal channels keep the graph legible — <Pill tone="accent">color = entity type</Pill>{" "}
            <Pill tone="neutral">shape = family</Pill> and <VerdictBadge verdict="malicious" /> as its own pip.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {([
              ["category", "14 primitives"],
              ["palette", "token-sourced"],
              ["accessibility_new", "62 axe tests"],
              ["dark_mode", "light + dark"],
            ] as [string, string][]).map(([icon, label]) => (
              <span key={label} className="flex items-center gap-2 rounded-md border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-1))] px-3 py-2 text-xs text-[hsl(var(--nx-fg-muted))]">
                <Icon name={icon} size={18} className="text-[hsl(var(--nx-accent))]" /> {label}
              </span>
            ))}
          </div>
        </Section>

        <Section id="foundations" title="Foundations" kicker="Tokens">
          <p className="max-w-2xl text-sm leading-relaxed text-[hsl(var(--nx-fg-muted))]">
            Tokens are the single source of truth. No component hardcodes a hue, blur, or duration.
            Values shown are read live from <span className="font-mono text-[11px]">:root</span>.
          </p>
        </Section>

        <Section id="color" title="Color" kicker="Foundations">
          <h3 className="mb-3 text-sm font-semibold text-[hsl(var(--nx-fg))]">Background contexts</h3>
          <p className="mb-4 max-w-2xl text-xs text-[hsl(var(--nx-fg-muted))]">Two Radix-style background steps: the canvas (bg 1) and panels (bg 2) that lift off it, plus raised/hover surfaces.</p>
          <SwatchGrid tokens={BACKGROUNDS} />
          <h3 className="mb-3 mt-8 text-sm font-semibold text-[hsl(var(--nx-fg))]">Borders & accent</h3>
          <SwatchGrid tokens={[...LINES, ...ACCENTS]} kind="border" />
          <h3 className="mb-3 mt-8 text-sm font-semibold text-[hsl(var(--nx-fg))]">Text</h3>
          <SwatchGrid tokens={TEXTS} kind="text" />
          <h3 className="mb-3 mt-8 text-sm font-semibold text-[hsl(var(--nx-fg))]">Entity color (channel 1 — type)</h3>
          <SwatchGrid tokens={ENTITIES} />
          <h3 className="mb-3 mt-8 text-sm font-semibold text-[hsl(var(--nx-fg))]">Severity (own channel — verdict)</h3>
          <SwatchGrid tokens={SEVERITIES} />
        </Section>

        <Section id="type" title="Typography" kicker="Foundations">
          <Card className="divide-y divide-[hsl(var(--nx-border))]">
            <div className="p-5">
              <p className="text-2xl font-semibold tracking-tight text-[hsl(var(--nx-fg))]">The quick brown fox</p>
              <p className="mt-1 font-mono text-[10px] text-[hsl(var(--nx-fg-subtle))]">--nx-font-sans · semibold</p>
            </div>
            <div className="p-5">
              <p className="text-sm text-[hsl(var(--nx-fg-muted))]">Body copy sits at the muted token for comfortable reading on dark surfaces — secondary information that supports the primary content without competing with it.</p>
              <p className="mt-1 font-mono text-[10px] text-[hsl(var(--nx-fg-subtle))]">--nx-font-sans · regular · --nx-fg-muted</p>
            </div>
            <div className="p-5">
              <p className="font-mono text-sm text-[hsl(var(--nx-fg))]">SHA256 a376453b3f16d3b2 · 198.51.100.24</p>
              <p className="mt-1 font-mono text-[10px] text-[hsl(var(--nx-fg-subtle))]">--nx-font-mono · indicators / hashes</p>
            </div>
          </Card>
        </Section>

        <Section id="radius-motion" title="Radius & motion" kicker="Foundations">
          <h3 className="mb-3 text-sm font-semibold text-[hsl(var(--nx-fg))]">Radius</h3>
          <div className="flex flex-wrap gap-6">
            {RADII.map(([name, label]) => (
              <div key={name} className="text-center">
                <div className="h-16 w-16 border-2 border-[hsl(var(--nx-border-strong))] bg-[hsl(var(--nx-surface-2))]" style={{ borderRadius: `var(${name})` }} />
                <p className="mt-2 text-xs text-[hsl(var(--nx-fg))]">{label}</p>
                <p className="font-mono text-[10px] text-[hsl(var(--nx-fg-subtle))]">{name}</p>
              </div>
            ))}
          </div>
          <h3 className="mb-3 mt-8 text-sm font-semibold text-[hsl(var(--nx-fg))]">Motion — durations</h3>
          <p className="mb-4 max-w-2xl text-xs text-[hsl(var(--nx-fg-muted))]">Standard chrome transitions reference these tokens; entrances use <span className="font-mono text-[11px]">--nx-ease-out</span>. The canvas adds a reviewable preset layer (Smooth / Floaty / Snappy) on top.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {MOTION.map(([name, label]) => (
              <div key={name} className="rounded-md border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-1))] p-3">
                <p className="font-mono text-xs text-[hsl(var(--nx-fg))]">{tokenValue(name) || "—"}</p>
                <p className="mt-0.5 text-[11px] text-[hsl(var(--nx-fg-muted))]">{label}</p>
                <p className="font-mono text-[10px] text-[hsl(var(--nx-fg-subtle))]">{name}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="components" title="Components" kicker="Live gallery">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Specimen title="Icon" note="Material Symbol. Outlined by default; filled only for active states. Min 20px for controls.">
              <Icon name="hub" size={28} />
              <Icon name="campaign" size={28} />
              <Icon name="shield_person" size={28} filled />
            </Specimen>

            <Specimen title="ToolButton" note="Square icon control with a built-in Tooltip. Variant: active. Shared by all canvas chrome.">
              <ToolButton icon="save" label="Save" />
              <ToolButton icon="route" label="Highlight path" active />
              <ToolButton icon="history" label="History" />
            </Specimen>

            <Specimen title="Tooltip" note="Real DOM tooltip (not the browser title). Hover the star. Variant: side.">
              <Tooltip label="I'm a tooltip" side="top">
                <button className="grid h-9 w-9 place-items-center rounded-md border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-2))] text-[hsl(var(--nx-fg))]">★</button>
              </Tooltip>
              <span className="text-xs text-[hsl(var(--nx-fg-subtle))]">← hover</span>
            </Specimen>

            <Specimen title="EntityIcon" note="EntityType → glyph, colored by its entity token.">
              {(["actor", "campaign", "malware", "domain", "email_address"] as EntityType[]).map((t) => (
                <EntityIcon key={t} type={t} size={26} />
              ))}
            </Specimen>

            <Specimen title="ShapeIcon" note="Family silhouettes — the shape channel.">
              <ShapeIcon shape="circle" size={24} />
              <ShapeIcon shape="square" size={24} />
              <ShapeIcon shape="diamond" size={24} />
              <ShapeIcon shape="hexagon" size={24} />
            </Specimen>

            <Specimen title="VerdictBadge" note="Severity as a tinted pill + label.">
              <VerdictBadge verdict="malicious" />
              <VerdictBadge verdict="suspicious" />
              <VerdictBadge verdict="benign" />
            </Specimen>

            <Specimen title="VerdictPip · CountChip" note="The node sub-indicators: severity dot and '+N' overflow.">
              <VerdictPip verdict="malicious" />
              <VerdictPip verdict="medium" />
              <VerdictPip verdict="benign" />
              <CountChip count={3} />
              <CountChip count={12} />
            </Specimen>

            <Specimen title="Pill" note="Compact rounded tag, toned.">
              <Pill tone="neutral">neutral</Pill>
              <Pill tone="accent">accent</Pill>
            </Specimen>

            <Specimen title="StatCircle" note="Ringed KPI metric.">
              <StatCircle label="DLP" value={42} tone="malicious" />
              <StatCircle label="Logins" value={1280} tone="neutral" />
              <StatCircle label="Clean" value={98} tone="benign" />
            </Specimen>

            <Specimen title="Stepper" note="Multi-step flow indicator (e.g. the Splunk wizard).">
              <Stepper steps={["Connect", "Authorize", "Verify"]} current={1} />
            </Specimen>
          </div>

          <h3 className="mb-3 mt-8 text-sm font-semibold text-[hsl(var(--nx-fg))]">States</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Card className="p-6"><StateBlock kind="loading" title="Loading graph" message="Fetching neighbors…" /></Card>
            <Card className="p-6"><StateBlock kind="empty" title="No results" message="Nothing matched that query." /></Card>
            <Card className="p-6"><StateBlock kind="error" title="Couldn't load" message="The data port is unreachable." /></Card>
          </div>
        </Section>

        <Section id="nodes" title="The node system" kicker="Centerpiece">
          <p className="mb-6 max-w-2xl text-sm leading-relaxed text-[hsl(var(--nx-fg-muted))]">
            <span className="font-mono text-[11px]">NodeBadge</span> is the variant-driven node — the Figma "Node" component set.
            Color = type, shape = family, verdict = its own pip; flags (VIP / status / imposter / +N) combine into one
            top-right cluster. Every node shares a translucent token fill behind a backdrop blur so edges recede.
          </p>

          <h3 className="mb-3 text-sm font-semibold text-[hsl(var(--nx-fg))]">Families (shape channel)</h3>
          <div className="flex flex-wrap gap-4 rounded-lg border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-bg))] p-8">
            {SAMPLE_TYPES.map((t) => (
              <NodeBadge key={t} family={mapShape(t)} role="neighbor" colorToken={ENTITY_META[t].colorToken} glyph={ENTITY_SYMBOL[t]} label={ENTITY_META[t].label} sublabel={ENTITY_META[t].label} verdict="suspicious" />
            ))}
          </div>

          <h3 className="mb-3 mt-8 text-sm font-semibold text-[hsl(var(--nx-fg))]">Role, states & indicators</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-lg border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-bg))] p-8">
            <NodeBadge family="circle" role="hub" colorToken="campaign" glyph="campaign" label="Hub (root)" sublabel="campaign" verdict="malicious" />
            <NodeBadge family="circle" role="neighbor" colorToken="actor" glyph="badge" label="Selected" sublabel="actor" selected verdict="malicious" />
            <NodeBadge family="circle" role="neighbor" colorToken="malware" glyph="coronavirus" label="Focused" sublabel="malware" focused />
            <NodeBadge family="hexagon" role="neighbor" colorToken="email" glyph="alternate_email" label="VIP · impacted" sublabel="email address" vip status="impacted" verdict="medium" hiddenChildren={2} />
            <NodeBadge family="hexagon" role="neighbor" colorToken="email" glyph="alternate_email" label="At-risk" sublabel="email address" status="at_risk" />
            <NodeBadge family="circle" role="neighbor" colorToken="domain" glyph="language" label="Imposter" sublabel="domain" imposter />
            <NodeBadge family="circle" role="neighbor" colorToken="malware" glyph="coronavirus" label="Aggregate" sublabel="malware" aggregate hiddenChildren={6} />
            <NodeBadge family="circle" role="neighbor" colorToken="hostname" glyph="dns" label="Hidden" sublabel="hostname" hidden />
          </div>

          <h3 className="mb-3 mt-8 text-sm font-semibold text-[hsl(var(--nx-fg))]">GraphLegend</h3>
          <p className="mb-4 max-w-2xl text-xs text-[hsl(var(--nx-fg-muted))]">Dynamic — decodes only the types + verdicts present on a canvas. Shown expanded here.</p>
          <div className="inline-block rounded-lg border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-bg))] p-6">
            <GraphLegend types={SAMPLE_TYPES} verdicts={["malicious", "suspicious", "medium", "benign"]} />
          </div>
        </Section>

        <Section id="principles" title="Principles" kicker="Usage">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {([
              ["palette", "Three orthogonal channels", "Color encodes entity type, shape encodes family, verdict lives on its own pip. They never collide — so a node reads at a glance and the legend stays trustworthy."],
              ["bolt", "Fill is for active only", "Material Symbols are outlined by default; the FILL axis flips to 1 only for active/selected/hub states. Don't use fill for decoration."],
              ["contrast", "Token-sourced color", "No component hardcodes a hue. Two background contexts (canvas / panels), AA-safe text, and a dark-first ramp that has a light override."],
              ["animation", "Motion that informs", "Entrances ease-out; new nodes expand from their parent; edges stay locked to centers and never draw ahead. Honors prefers-reduced-motion."],
            ] as [string, string, string][]).map(([icon, title, body]) => (
              <Card key={title} className="p-5">
                <Icon name={icon} size={22} className="text-[hsl(var(--nx-accent))]" />
                <p className="mt-2 text-sm font-semibold text-[hsl(var(--nx-fg))]">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[hsl(var(--nx-fg-muted))]">{body}</p>
              </Card>
            ))}
          </div>
          <p className="mt-8 text-xs text-[hsl(var(--nx-fg-subtle))]">
            Built with the system it documents · tokens in <span className="font-mono">@nexus/tokens</span> · components in{" "}
            <span className="font-mono">@nexus/ui</span>.
          </p>
        </Section>
      </main>
    </div>
  );
}

// Map an entity type to its node family (mirrors the canvas's shapeOf taxonomy).
function mapShape(t: EntityType): "circle" | "square" | "diamond" | "hexagon" {
  if (["actor", "campaign", "malware"].includes(t)) return "circle";
  if (["exploit", "sid", "scan"].includes(t)) return "diamond";
  if (["email_address", "prs_message"].includes(t)) return "hexagon";
  return "square";
}
