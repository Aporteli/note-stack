import type { Config } from "tailwindcss";

/** Every colour resolves to a CSS variable, so themes can be swapped at runtime. */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        orchid: {
          DEFAULT: token("orchid"),
          100: token("orchid-100"),
          700: token("orchid-700"),
        },
        coral: token("coral"),
        lagoon: token("lagoon"),
        mint: token("mint"),
        plum: {
          DEFAULT: token("plum"),
          700: token("plum-700"),
          900: token("plum-900"),
        },
        canvas: token("canvas"),
        paper: token("paper"),
        surface: {
          DEFAULT: token("surface"),
          sunk: token("surface-sunk"),
        },
        line: {
          DEFAULT: token("line"),
          strong: token("line-strong"),
        },
        ink: {
          DEFAULT: token("ink"),
          soft: token("ink-soft"),
          faint: token("ink-faint"),
          invert: token("ink-invert"),
        },
        danger: token("danger"),
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
      },
      fontSize: {
        // A 1.25 scale, tuned so board chrome stays quiet and card text stays legible.
        micro: ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.01em" }],
        meta: ["0.75rem", { lineHeight: "1.125rem" }],
        body: ["0.875rem", { lineHeight: "1.375rem" }],
        lead: ["1rem", { lineHeight: "1.5rem" }],
        title: ["1.25rem", { lineHeight: "1.65rem", letterSpacing: "-0.01em" }],
        display: ["2rem", { lineHeight: "2.25rem", letterSpacing: "-0.025em" }],
        hero: ["2.75rem", { lineHeight: "2.9rem", letterSpacing: "-0.03em" }],
      },
      borderRadius: {
        card: "var(--r-card)",
        panel: "var(--r-panel)",
        pill: "var(--r-pill)",
      },
      boxShadow: {
        "lift-1": "var(--lift-1)",
        "lift-2": "var(--lift-2)",
        "lift-3": "var(--lift-3)",
      },
      width: { list: "var(--list-w)" },
      transitionTimingFunction: { ns: "cubic-bezier(0.2,0.8,0.3,1)" },
    },
  },
  plugins: [],
} satisfies Config;
