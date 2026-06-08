import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    // include the UI package source so its utility classes are generated
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: "var(--nx-font-sans)",
        mono: "var(--nx-font-mono)",
      },
    },
  },
  plugins: [],
} satisfies Config;
