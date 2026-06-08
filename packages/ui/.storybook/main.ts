import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath, URL } from "node:url";

const src = (p: string) => fileURLToPath(new URL(p, import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-a11y"],
  framework: { name: "@storybook/react-vite", options: {} },
  core: { disableTelemetry: true },
  // Resolve the workspace packages the stories/components reference to source.
  viteFinal: async (cfg) => {
    cfg.resolve = cfg.resolve ?? {};
    cfg.resolve.alias = {
      ...(cfg.resolve.alias as Record<string, string>),
      "@nexus/tokens/index.css": src("../../tokens/src/index.css"),
      "@nexus/tokens": src("../../tokens/src/index.ts"),
      "@nexus/domain": src("../../domain/src/index.ts"),
    };
    return cfg;
  },
};

export default config;
