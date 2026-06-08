// @ts-check
// Docusaurus guides site for Nexus. Hosts the prose docs (../../docs/*.md) at the Pages
// root (/nexus/), and links out to the Storybook component explorer and the live demo.
// Markdown is parsed as CommonMark (format: 'md') so the existing guides — which contain
// `{}`/`<>` in code/DDR blocks — don't trip MDX's JSX parser.

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Nexus Design System",
  tagline: "A dark-first design system + threat-explorer for SOC link analysis",
  url: "https://snds.github.io",
  baseUrl: "/nexus/",
  organizationName: "snds",
  projectName: "nexus",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  markdown: { format: "md" },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: "../../docs",
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
        },
        blog: false,
        theme: { customCss: require.resolve("./src/css/custom.css") },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: { defaultMode: "dark", respectPrefersColorScheme: false },
      navbar: {
        title: "Nexus DS",
        items: [
          { href: "/nexus/storybook/", label: "Storybook", position: "right" },
          { href: "/nexus/app/", label: "Live demo", position: "right" },
          { href: "https://github.com/snds/nexus", label: "GitHub", position: "right" },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Surfaces",
            items: [
              { label: "Component explorer (Storybook)", href: "/nexus/storybook/" },
              { label: "Threat Explorer demo", href: "/nexus/app/" },
            ],
          },
          {
            title: "Source",
            items: [{ label: "GitHub", href: "https://github.com/snds/nexus" }],
          },
        ],
        copyright: "Nexus — built with the design system it documents.",
      },
      prism: {
        theme: require("prism-react-renderer").themes.vsDark,
      },
    }),
};

module.exports = config;
