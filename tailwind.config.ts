import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        lato: ["Lato", "sans-serif"],
        cinzel: ["Cinzel", "serif"],
        medievalSharp: ["MedievalSharp", "cursive"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // Nova paleta de cores unificada
        primary: {
          DEFAULT: '#bf7918', // Brandy Punch 500
          hover: '#AD6915',
          pressed: '#8F510E',
          contrast: '#FFFFFF'
        },
        secondary: {
          DEFAULT: '#3b82f6', // Azure Radiance 500
          hover: '#306FDB',
          pressed: '#2153B8',
          contrast: '#FFFFFF'
        },
        danger: {
          DEFAULT: '#ef4444', // Cinnabar 500
          hover: '#D93636',
          contrast: '#FFFFFF'
        },
        success: {
          DEFAULT: '#3f693f', // Killarney 500
          hover: '#335E33',
          contrast: '#FFFFFF'
        },
        warning: {
          DEFAULT: '#cb9b43', // Tussock 500
          hover: '#B88637',
          contrast: '#000000'
        },
        background: {
          base: '#312e26', // Nova cor de fundo mais escura
          elevated: '#3d3a31', // Ajustado para ser um pouco mais claro que o base
          card: '#4a4639', // Ajustado para ser um pouco mais claro que o elevated
          input: '#57533f', // Ajustado para ser um pouco mais claro que o card
        },
        text: {
          heading: '#F5F4F2', // Zorba 100
          default: '#D9D6D0', // Zorba 300
          muted: '#A19990',   // Zorba 500
          subtle: '#736350',  // Zorba 700
          link: '#74B4F7',
          link_hover: '#3b82f6',
        },
        border: {
          DEFAULT: '#3B2B16',
          focus: '#bf7918',
          card: '#43341c',
        },
        graph: {
          purple: '#a855f7',
          red: '#ef4444',
          blue: '#3b82f6',
          green: '#3f693f',
          yellow: '#cb9b43',
        },
        // Mantendo compatibilidade com a estrutura anterior
        parchment: {
          DEFAULT: "#D9D6D0",
          light: "#F5F4F2",
          dark: "#A19990",
        },
        dark: {
          DEFAULT: "#312e26",
          light: "#4a4639",
          dark: "#262420",
        },
        accent: {
          DEFAULT: "#bf7918",
          light: "#cb9b43",
          dark: "#8F510E",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#736350",
          foreground: "#D9D6D0",
        },
        chart: {
          "1": "#a855f7",
          "2": "#ef4444",
          "3": "#3b82f6",
          "4": "#3f693f",
          "5": "#cb9b43",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      scale: {
        '115': '1.15',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
