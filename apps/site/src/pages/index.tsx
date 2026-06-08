/**
 * Landing page — built ENTIRELY from the design system (DS components + tokens + interactions),
 * not Infima. Wrapped in the Docusaurus Layout (whose chrome is itself DS-tokened + swizzled).
 */
import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import { Button, Pill, Icon, NodeBadge } from "@nexus/ui/nexus";

const card = {
  borderRadius: 12,
  border: "1px solid hsl(var(--nx-border))",
  background: "hsl(var(--nx-surface-1))",
  padding: 20,
} as const;

function Feature({ icon, title, body, href, cta }: { icon: string; title: string; body: string; href: string; cta: string }) {
  return (
    <div style={card}>
      <span style={{ display: "grid", placeItems: "center", height: 36, width: 36, borderRadius: 8, background: "hsl(var(--nx-accent) / 0.14)", color: "hsl(var(--nx-accent))" }}>
        <Icon name={icon} size={22} />
      </span>
      <p style={{ marginTop: 12, marginBottom: 4, fontWeight: 600, color: "hsl(var(--nx-fg))" }}>{title}</p>
      <p style={{ fontSize: 13, lineHeight: 1.5, color: "hsl(var(--nx-fg-muted))" }}>{body}</p>
      <Button asChild variant="link" size="sm" className="!px-0">
        <a href={href}>{cta} →</a>
      </Button>
    </div>
  );
}

export default function Home() {
  return (
    <Layout title="Nexus Design System" description="A dark-first shadcn/Radix design system for SOC link-analysis surfaces.">
      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "64px 24px 96px" }}>
        {/* hero — DS components */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ display: "grid", placeItems: "center", height: 40, width: 40, borderRadius: 10, background: "hsl(var(--nx-accent) / 0.15)", color: "hsl(var(--nx-accent))" }}>
            <Icon name="hub" size={24} filled />
          </span>
          <Pill tone="accent">Design System</Pill>
        </div>
        <h1 style={{ fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.02em", margin: 0, color: "hsl(var(--nx-fg))" }}>
          Nexus Design System
        </h1>
        <p style={{ marginTop: 16, maxWidth: 640, fontSize: 16, lineHeight: 1.6, color: "hsl(var(--nx-fg-muted))" }}>
          A dark-first, <strong style={{ color: "hsl(var(--nx-fg))" }}>shadcn/Radix</strong> design system for SOC
          link-analysis surfaces. The demo, these docs, and the Storybook explorer all consume — and are built from —
          this one system. This page is rendered with the design system's own components.
        </p>
        <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Button asChild>
            <Link to="/docs/">Read the docs</Link>
          </Button>
          <Button asChild variant="outline">
            <a href="/nexus/storybook/">Open Storybook</a>
          </Button>
          <Button asChild variant="ghost">
            <a href="/nexus/app/">Live demo</a>
          </Button>
        </div>

        {/* live DS components — the node language */}
        <div style={{ ...card, marginTop: 40, background: "hsl(var(--nx-bg))", display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <NodeBadge family="circle" role="hub" colorToken="campaign" glyph="campaign" label="Zloader Botnet" sublabel="campaign" verdict="malicious" />
          <NodeBadge family="circle" role="neighbor" colorToken="actor" glyph="badge" label="TA511" sublabel="actor" verdict="malicious" selected />
          <NodeBadge family="hexagon" role="neighbor" colorToken="email" glyph="alternate_email" label="rcastle@acme.com" sublabel="email address" vip status="impacted" verdict="medium" hiddenChildren={2} />
          <NodeBadge family="diamond" role="neighbor" colorToken="exploit" glyph="gpp_bad" label="CVE-2021-40444" sublabel="exploit" />
        </div>

        {/* surfaces */}
        <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <Feature icon="palette" title="Foundations" body="Tokens are the single source of truth — two background contexts, AA text, entity + severity color, motion." href="/nexus/docs/foundations" cta="Tokens" />
          <Feature icon="category" title="Components" body="shadcn/Radix base primitives + product wrappers. Interactive variants with the a11y addon." href="/nexus/storybook/" cta="Storybook" />
          <Feature icon="hub" title="Demo" body="The Threat Explorer — the design system in real product use over a live graph canvas." href="/nexus/app/" cta="Explore" />
        </div>
      </main>
    </Layout>
  );
}
