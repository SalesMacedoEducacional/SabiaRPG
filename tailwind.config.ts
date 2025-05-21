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
        light: "#F5F2EC",  // fundo principal claro
        "light-2": "#E0DCD1",  // fundo secundário claro
        base: "#312E26",  // texto principal escuro
        muted: "#5A5346",  // texto secundário
        accent: "#D4A054",  // destaque dourado (mantido)
        primary: "#A6936C",  // bordas e separadores terrosos suaves
        danger: "#C0392B",  // alertas/erros
        
        // Mantendo compatibilidade com cores de componentes existentes
        destructive: {
          DEFAULT: "#C0392B",
          foreground: "#F5F2EC",
        },
        
        // Background - agora cores claras
        background: {
          base: '#F5F2EC', 
          elevated: '#E0DCD1',
          card: '#E8E4DA',
          input: '#F0EDE8',
        },
        
        // Texto - agora escuro sobre fundo claro
        text: {
          heading: '#312E26',
          default: '#433D33',
          muted: '#5A5346',
          subtle: '#7A7367',
          link: '#B37F32',
          link_hover: '#D4A054',
        },
        
        // Bordas - mantendo tons terrosos
        border: {
          DEFAULT: '#A6936C',
          focus: '#D4A054',
          card: '#C5B99D',
        },
        
        // Gráficos - mantendo as cores originais para destaque
        graph: {
          purple: '#9C59B6',
          red: '#C0392B',
          blue: '#3498DB',
          green: '#27AE60',
          yellow: '#D4A054',
        },
        
        // Mantendo compatibilidade com a estrutura anterior
        parchment: {
          DEFAULT: "#F5F2EC", // atualizado para novo esquema
          light: "#FFFFFF",
          dark: "#E0DCD1",
        },
        
        dark: {
          DEFAULT: "#312E26", // mantido como estava para referências existentes
          light: "#4A4639",
          dark: "#262420",
        },
        
        // Mantendo accent com novo valor
        accent: {
          DEFAULT: "#D4A054",
          light: "#E5BB7B",
          dark: "#B37F32",
          foreground: "#FFFFFF",
        },
        
        // Ajustando muted para nova paleta
        muted: {
          DEFAULT: "#5A5346",
          foreground: "#F5F2EC",
        },
        
        // Mantendo chart para compatibilidade
        chart: {
          "1": "#9C59B6",
          "2": "#C0392B",
          "3": "#3498DB",
          "4": "#27AE60",
          "5": "#D4A054",
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
