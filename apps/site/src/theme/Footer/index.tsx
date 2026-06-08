/**
 * Swizzled Footer — rebuilt from the design system (tokens + DS Icon) instead of the default
 * Infima footer, so the chrome dogfoods the DS.
 */
import React from "react";
import Link from "@docusaurus/Link";
import { Icon } from "@nexus/ui/nexus";

const linkStyle = { color: "hsl(var(--nx-fg-muted))", fontSize: 13, textDecoration: "none" } as const;

function Col({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "hsl(var(--nx-fg-subtle))" }}>{title}</p>
      {children}
    </div>
  );
}

export default function Footer(): React.JSX.Element {
  return (
    <footer style={{ borderTop: "1px solid hsl(var(--nx-border))", background: "hsl(var(--nx-surface-1))", padding: "36px 24px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "space-between" }}>
        <div style={{ maxWidth: 280 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "grid", placeItems: "center", height: 28, width: 28, borderRadius: 8, background: "hsl(var(--nx-accent) / 0.15)", color: "hsl(var(--nx-accent))" }}>
              <Icon name="hub" size={18} filled />
            </span>
            <strong style={{ color: "hsl(var(--nx-fg))" }}>Nexus Design System</strong>
          </div>
          <p style={{ marginTop: 10, fontSize: 13, lineHeight: 1.5, color: "hsl(var(--nx-fg-muted))" }}>
            These docs are built with the system they document.
          </p>
        </div>
        <Col title="Explore">
          <Link style={linkStyle} to="/docs/">Documentation</Link>
          <a style={linkStyle} href="/nexus/storybook/">Storybook</a>
          <a style={linkStyle} href="/nexus/app/">Threat Explorer demo</a>
        </Col>
        <Col title="Source">
          <a style={linkStyle} href="https://github.com/snds/nexus">GitHub</a>
        </Col>
      </div>
      <p style={{ maxWidth: 1040, margin: "24px auto 0", fontSize: 12, color: "hsl(var(--nx-fg-subtle))" }}>
        Nexus Design System — a shadcn/Radix system dogfooded across demo, docs, and Storybook.
      </p>
    </footer>
  );
}
