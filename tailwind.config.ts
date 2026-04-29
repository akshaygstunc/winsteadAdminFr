import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
       colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        card: "var(--card)",
        line: "var(--line)",
        gold: "var(--gold)",
        text: "var(--text)",
        muted: "var(--muted)",
      },
      boxShadow: { luxury: "0 10px 30px rgba(0,0,0,0.35)" },
    },
  },
  plugins: [],
};
export default config;
