// @ts-check
// Docusaurus — EXCLUSIVELY the Nexus design-system documentation. It DOGFOODS the DS:
// MDX pages import the real @nexus/ui components and read @nexus/tokens live. A small plugin
// aliases the workspace packages and adds Tailwind (utilities only — preflight is off so it
// doesn't fight Infima) so those components render fully styled inside the docs.
const path = require("path");

const pkg = (p) => path.resolve(__dirname, "../../packages", p);

/** Dogfood plugin: resolve @nexus/* to source + enable Tailwind in the PostCSS pipeline. */
function nexusDsPlugin() {
  return {
    name: "nexus-ds",
    configureWebpack() {
      return {
        resolve: {
          // The workspace source uses ESM `.js` import specifiers that resolve to `.ts`/`.tsx`.
          extensionAlias: { ".js": [".tsx", ".ts", ".js"] },
          alias: {
            "@nexus/tokens/index.css": pkg("tokens/src/index.css"),
            "@nexus/tokens$": pkg("tokens/src/index.ts"),
            "@nexus/domain$": pkg("domain/src/index.ts"),
            "@nexus/ui/nexus": pkg("ui/src/components/nexus/index.ts"),
            "@nexus/ui/lib/utils": pkg("ui/src/lib/utils.ts"),
            "@nexus/ui$": pkg("ui/src/index.ts"),
          },
        },
      };
    },
    configurePostCss(options) {
      options.plugins.push(require("tailwindcss"), require("autoprefixer"));
      return options;
    },
  };
}

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Nexus Design System",
  tagline: "A dark-first, shadcn/Radix design system for SOC link-analysis surfaces",
  url: "https://snds.github.io",
  baseUrl: "/nexus/",
  organizationName: "snds",
  projectName: "nexus",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  stylesheets: [
    "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
  ],

  plugins: [
    nexusDsPlugin,
    [
      // Offline/local search — no Algolia account or API keys required.
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        indexDocs: true,
        indexPages: true,
        docsRouteBasePath: "/docs",
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: "docs",
          routeBasePath: "/docs",
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
      colorMode: { defaultMode: "dark", disableSwitch: true, respectPrefersColorScheme: false },
      navbar: {
        title: "Nexus DS",
        items: [
          { type: "docSidebar", sidebarId: "ds", position: "left", label: "Documentation" },
          { href: "/nexus/storybook/", label: "Storybook", position: "right" },
          { href: "/nexus/app/", label: "Live demo", position: "right" },
          { href: "https://github.com/snds/nexus", label: "GitHub", position: "right" },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Explore",
            items: [
              { label: "Component explorer (Storybook)", href: "/nexus/storybook/" },
              { label: "Threat Explorer demo", href: "/nexus/app/" },
            ],
          },
          { title: "Source", items: [{ label: "GitHub", href: "https://github.com/snds/nexus" }] },
        ],
        copyright: "Nexus Design System — these docs are built with the system they document.",
      },
      prism: { theme: require("prism-react-renderer").themes.vsDark },
    }),
};

module.exports = config;
