import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const src = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// Explicit aliases to workspace SOURCE so Vite treats internal packages as first-party
// TS (no build step needed). Order matters: most specific first.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@nexus/tokens/index.css", replacement: src("../../packages/tokens/src/index.css") },
      { find: "@nexus/tokens", replacement: src("../../packages/tokens/src/index.ts") },
      { find: "@nexus/domain", replacement: src("../../packages/domain/src/index.ts") },
      { find: "@nexus/graph", replacement: src("../../packages/graph/src/index.ts") },
      { find: "@nexus/integrations/mock", replacement: src("../../packages/integrations/src/mock.ts") },
      { find: "@nexus/integrations", replacement: src("../../packages/integrations/src/index.ts") },
      { find: "@nexus/ui/nexus", replacement: src("../../packages/ui/src/components/nexus/index.ts") },
      { find: "@nexus/ui/lib/utils", replacement: src("../../packages/ui/src/lib/utils.ts") },
      { find: "@nexus/ui", replacement: src("../../packages/ui/src/index.ts") },
    ],
  },
  server: { port: 5173 },
});
