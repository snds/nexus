// Storybook MANAGER chrome themed with the design system's tokens — so the explorer's own
// surfaces, borders, text, accent, fonts and radius ARE the DS (not Storybook's default).
// The manager UI is a separate app where our tokens.css isn't loaded, so the DS token values
// are inlined here as resolved colors (each annotated with its token).
import { addons } from "@storybook/manager-api";
import { create } from "@storybook/theming/create";

const SANS = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const MONO = 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace';

const theme = create({
  base: "dark",
  brandTitle: "Nexus Design System",
  brandUrl: "/nexus/",

  // surfaces
  appBg: "hsl(222 38% 5%)", // --nx-bg
  appContentBg: "hsl(222 26% 10%)", // --nx-surface-1
  appPreviewBg: "hsl(222 38% 5%)", // --nx-bg
  appBorderColor: "hsl(222 14% 22%)", // --nx-border
  appBorderRadius: 8, // --nx-radius

  // toolbars
  barBg: "hsl(222 26% 10%)", // --nx-surface-1
  barTextColor: "hsl(214 14% 66%)", // --nx-fg-muted
  barSelectedColor: "hsl(205 90% 56%)", // --nx-accent
  barHoverColor: "hsl(205 90% 56%)",

  // text
  textColor: "hsl(210 30% 96%)", // --nx-fg
  textMutedColor: "hsl(214 13% 62%)", // --nx-fg-subtle
  textInverseColor: "hsl(222 38% 5%)",

  // accent
  colorPrimary: "hsl(205 90% 56%)", // --nx-accent
  colorSecondary: "hsl(205 90% 56%)", // --nx-accent (selection/active)

  // inputs
  inputBg: "hsl(222 20% 13%)", // --nx-surface-2
  inputBorder: "hsl(222 14% 22%)", // --nx-border
  inputTextColor: "hsl(210 30% 96%)", // --nx-fg
  inputBorderRadius: 6,

  fontBase: SANS,
  fontCode: MONO,
});

addons.setConfig({ theme });
