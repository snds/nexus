/**
 * Swizzled Navbar content — the top chrome is rebuilt from the design system: a DS logo mark,
 * DS-styled nav links, and icon links wrapped in the DS Tooltip (real DS interaction). Only the
 * mobile sidebar toggle is reused from Docusaurus so the responsive drawer keeps working.
 */
import React from "react";
import Link from "@docusaurus/Link";
import { useNavbarMobileSidebar } from "@docusaurus/theme-common/internal";
import NavbarMobileSidebarToggle from "@theme/Navbar/MobileSidebar/Toggle";
import SearchBar from "@theme/SearchBar";
import { Icon, Tooltip } from "@nexus/ui/nexus";

function Brand() {
  return (
    <Link to="/" className="tw" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
      <span style={{ display: "grid", placeItems: "center", height: 30, width: 30, borderRadius: 8, background: "color-mix(in srgb, var(--nx-accent) 15%, transparent)", color: "var(--nx-accent)" }}>
        <Icon name="hub" size={20} filled />
      </span>
      <strong style={{ color: "var(--nx-fg)", fontSize: 15 }}>Nexus DS</strong>
    </Link>
  );
}

function NavLink({ to, href, children }: { to?: string; href?: string; children: React.ReactNode }) {
  const cls = "rounded-md px-2.5 py-1.5 text-sm text-[var(--nx-fg-muted)] no-underline transition-colors hover:bg-[var(--nx-surface-2)] hover:text-[var(--nx-fg)] hover:no-underline";
  return to ? <Link to={to} className={cls}>{children}</Link> : <a href={href} className={cls}>{children}</a>;
}

function IconLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Tooltip label={label} side="bottom">
      <a
        href={href}
        aria-label={label}
        className="grid h-9 w-9 place-items-center rounded-md text-[var(--nx-fg-muted)] no-underline transition-colors hover:bg-[var(--nx-surface-2)] hover:text-[var(--nx-fg)]"
      >
        <Icon name={icon} size={20} />
      </a>
    </Tooltip>
  );
}

export default function NavbarContent(): React.JSX.Element {
  const mobileSidebar = useNavbarMobileSidebar();
  return (
    <div className="navbar__inner">
      <div className="navbar__items" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
        <Brand />
        <div className="ds-navlinks" style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 8 }}>
          <NavLink to="/docs/">Documentation</NavLink>
        </div>
      </div>
      <div className="navbar__items navbar__items--right" style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <SearchBar />
        <IconLink href="/nexus/storybook/" icon="deployed_code" label="Storybook" />
        <IconLink href="/nexus/app/" icon="play_circle" label="Live demo" />
        <IconLink href="https://github.com/snds/nexus" icon="code" label="GitHub" />
      </div>
    </div>
  );
}
