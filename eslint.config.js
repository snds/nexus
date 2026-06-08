// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

/**
 * Layer-boundary enforcement (architecture doc §6).
 * The seams we protect:
 *   - domain (L5)  : pure. No React, no vendor SDKs, no UI.
 *   - graph (L4)   : may use ui/nexus + domain. NEVER integrations or vendor SDKs.
 *   - app          : NEVER imports the pristine shadcn base (ui/components/ui/*) directly.
 *   - integrations : the ONLY place vendor SDKs (splunk/tap/ptr) may be imported.
 */
export default tseslint.config(
  { ignores: ["**/dist/**", "**/.turbo/**", "**/node_modules/**", "**/storybook-static/**", "design-source/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },

  // L5 domain — pure
  {
    files: ["packages/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["react", "react-dom", "react/*"], message: "domain (L5) must be pure — no React." },
            { group: ["@xyflow/*", "graphology*", "elkjs", "d3-*"], message: "domain (L5) must not know about the renderer/layout." },
            { group: ["@nexus/ui", "@nexus/ui/*", "@nexus/graph"], message: "domain (L5) is the lowest layer — it imports nothing from above." },
            { group: ["*splunk*", "*/tap/*", "*ptr*"], message: "domain (L5) talks to vendors via PORTS only; SDKs live in integrations/." },
          ],
        },
      ],
    },
  },

  // L4 graph — mechanics only; talks to vendors via domain ports
  {
    files: ["packages/graph/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@nexus/integrations*"], message: "graph (L4) must not import integrations — go through domain (L5) ports." },
            { group: ["*splunk*", "*ptr*"], message: "graph (L4) never imports vendor SDKs." },
          ],
        },
      ],
    },
  },

  // app — never reach past the wrapper into the pristine base
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@nexus/ui/components/ui/*", "**/components/ui/*"],
              message: "App imports from the WRAPPER layer (@nexus/ui), never the pristine shadcn base directly.",
            },
          ],
        },
      ],
    },
  },
);
