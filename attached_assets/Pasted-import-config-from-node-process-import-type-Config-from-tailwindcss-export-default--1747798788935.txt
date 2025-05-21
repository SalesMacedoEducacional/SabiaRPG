import { config } from "node:process";
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

      const config: Config = {

        // Ajuste os paths abaixo conforme sua estrutura de pastas
        content: [
          './src/**/*.{js,jsx,ts,tsx,vue,html}',
          './public/index.html',
        ],
        theme: {
          extend: {
            colors: {
              // Fundos claros (substituem os fundos escuros antigos)
              background: {
                base:     '#F5F2EC',  // fundo principal
                elevated: '#E0DCD1',  // cards, menus secundários
                card:     '#E8E4DA',  // cartões específicos
                input:    '#F0EDE8',  // campos de formulário
              },
              // Cores de texto sobre fundo claro
              text: {
                heading:    '#312E26', // títulos principais
                DEFAULT:    '#433D33', // texto padrão
                muted:      '#5A5346', // texto secundário
                subtle:     '#7A7367', // legendas/descrições menores
                link:       '#B37F32', // links
                link_hover: '#D4A054', // hover em links
              },
              // Acentos dourados (mantêm a identidade)
              accent: {
                DEFAULT:    '#D4A054',
                light:      '#E5BB7B',
                dark:       '#B37F32',
                foreground: '#FFFFFF',
              },
              // Bordas e separadores terrosos suaves
              primary:  '#A6936C',
              // Alertas e erros
              danger:   '#C0392B',
              // Tons escuros de apoio (caso ainda precise usar contrastes mais fortes)
              dark: {
                DEFAULT: '#312E26',
                light:   '#4A4639',
                dark:    '#262420',
              },
              // Cores para gráficos (compatível com bibliotecas de chart)
              graph: {
                purple: '#9C59B6',
                red:    '#C0392B',
                blue:   '#3498DB',
                green:  '#27AE60',
                yellow: '#D4A054',
              },
            },
          },
        },
        plugins: [],
      }

      export default config;
      
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
        "115": "1.15",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
