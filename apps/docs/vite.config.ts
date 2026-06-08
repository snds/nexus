import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const src = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// Resolve workspace packages to their SOURCE (no build step), and dogfood the real DS.
// `base` is parameterized so GitHub Pages can serve the docs under /nexus/.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@nexus/tokens/index.css", replacement: src("../../packages/tokens/src/index.css") },
      { find: "@nexus/tokens", replacement: src("../../packages/tokens/src/index.ts") },
      { find: "@nexus/domain", replacement: src("../../packages/domain/src/index.ts") },
      { find: "@nexus/ui/nexus", replacement: src("../../packages/ui/src/components/nexus/index.ts") },
      { find: "@nexus/ui/lib/utils", replacement: src("../../packages/ui/src/lib/utils.ts") },
      { find: "@nexus/ui", replacement: src("../../packages/ui/src/index.ts") },
    ],
  },
  server: { port: 5174 },
});
