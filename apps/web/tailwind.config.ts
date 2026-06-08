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
      colors: {
        background: "rgb(from var(--background) r g b / <alpha-value>)",
        foreground: "rgb(from var(--foreground) r g b / <alpha-value>)",
        card: { DEFAULT: "rgb(from var(--card) r g b / <alpha-value>)", foreground: "rgb(from var(--card-foreground) r g b / <alpha-value>)" },
        popover: { DEFAULT: "rgb(from var(--popover) r g b / <alpha-value>)", foreground: "rgb(from var(--popover-foreground) r g b / <alpha-value>)" },
        primary: { DEFAULT: "rgb(from var(--primary) r g b / <alpha-value>)", foreground: "rgb(from var(--primary-foreground) r g b / <alpha-value>)" },
        secondary: { DEFAULT: "rgb(from var(--secondary) r g b / <alpha-value>)", foreground: "rgb(from var(--secondary-foreground) r g b / <alpha-value>)" },
        muted: { DEFAULT: "rgb(from var(--muted) r g b / <alpha-value>)", foreground: "rgb(from var(--muted-foreground) r g b / <alpha-value>)" },
        accent: { DEFAULT: "rgb(from var(--accent) r g b / <alpha-value>)", foreground: "rgb(from var(--accent-foreground) r g b / <alpha-value>)" },
        destructive: { DEFAULT: "rgb(from var(--destructive) r g b / <alpha-value>)", foreground: "rgb(from var(--destructive-foreground) r g b / <alpha-value>)" },
        border: "rgb(from var(--border) r g b / <alpha-value>)",
        input: "rgb(from var(--input) r g b / <alpha-value>)",
        ring: "rgb(from var(--ring) r g b / <alpha-value>)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: "var(--nx-font-sans)",
        mono: "var(--nx-font-mono)",
      },
    },
  },
  plugins: [],
} satisfies Config;
