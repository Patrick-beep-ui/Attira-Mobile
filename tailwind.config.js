module.exports = {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter_400Regular"],
        display: ["PlayfairDisplay_600SemiBold"],
      },
      fontSize: {
        "display-1": [
          "36px",
          { lineHeight: "41.4px", letterSpacing: "-0.72px" },
        ],
        "display-2": [
          "28px",
          { lineHeight: "33.6px", letterSpacing: "-0.28px" },
        ],
        "display-3": [
          "22px",
          { lineHeight: "27.5px", letterSpacing: "-0.22px" },
        ],
        "body-lg": ["17px", { lineHeight: "25.5px" }],
        body: ["15px", { lineHeight: "23.25px" }],
        "body-sm": ["13px", { lineHeight: "19.5px" }],
        "body-xs": ["12px", { lineHeight: "18px" }],
        caption: ["11px", { lineHeight: "15.4px", letterSpacing: "0.44px" }],
      },
      colors: {
        background: "hsl(20 36% 95%)",
        foreground: "hsl(210 7% 8%)",
        border: "hsl(210 14% 89%)",
        input: "hsl(210 14% 89%)",
        ring: "hsl(340 45% 25%)",
        primary: { DEFAULT: "hsl(340 45% 25%)", foreground: "#fff" },
        secondary: {
          DEFAULT: "hsl(213 18% 23%)",
          foreground: "hsl(0 0% 96.5%)",
        },
        muted: { DEFAULT: "hsl(210 10% 92%)", foreground: "hsl(213 8% 48%)" },
        card: { DEFAULT: "#fff", foreground: "hsl(210 7% 8%)" },
        accent: { DEFAULT: "hsl(340 45% 25%)", foreground: "#fff" },
        popover: { DEFAULT: "#fff", foreground: "hsl(210 7% 8%)" },
        destructive: { DEFAULT: "hsl(0 72% 51%)", foreground: "#fff" },
        canvas: "hsl(0 0% 96.5%)",
        structure: { DEFAULT: "hsl(213 24% 22%)", deep: "hsl(218 33% 15%)" },
      },
      borderRadius: { lg: "14px", md: "12px", sm: "10px" },
    },
  },
  plugins: [],
};
