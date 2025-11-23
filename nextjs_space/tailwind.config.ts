import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'terminal': ['Courier New', 'Monaco', 'Consolas', 'monospace'],
        'mono': ['Courier New', 'Monaco', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-terminal': 'linear-gradient(180deg, #000000 0%, #000033 50%, #000000 100%)',
        'gradient-blue': 'linear-gradient(135deg, #0066ff 0%, #0047b3 50%, #003380 100%)',
        'gradient-glow': 'radial-gradient(circle at 50% 50%, rgba(0, 102, 255, 0.15), transparent 70%)',
        'scanline': 'repeating-linear-gradient(0deg, rgba(0, 102, 255, 0.05) 0px, transparent 1px, transparent 2px, rgba(0, 102, 255, 0.05) 3px)',
      },
      borderRadius: {
        'ios': '1.25rem',      // 20px - iOS large radius
        'ios-lg': '1.5rem',    // 24px - iOS extra large
        'ios-md': '1rem',      // 16px - iOS medium
        'ios-sm': '0.75rem',   // 12px - iOS small
        'ios-xs': '0.5rem',    // 8px - iOS extra small
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        // Terminal retro palette - Dark Blue Theme
        'terminal': {
          black: '#000000',
          'dark': '#000033',
          'darker': '#000022',
          blue: '#0066ff',        // Professional terminal blue
          'blue-bright': '#3385ff',
          'blue-dim': '#0047b3',
          'blue-dark': '#003380',
          'blue-darker': '#002266',
          'blue-glow': 'rgba(0, 102, 255, 0.5)',
          'blue-shadow': 'rgba(0, 102, 255, 0.2)',
        },
        // Swarm Intelligence / Hive Mind Neon Palette
        'neon': {
          cyan: '#00ffff',
          'cyan-bright': '#00ffff',
          'cyan-dim': '#00ddee',
          magenta: '#ff00ff',
          'magenta-bright': '#ff00ff',
          'magenta-dim': '#dd00dd',
          purple: '#8b5cf6',
          'purple-bright': '#a78bfa',
          'purple-dim': '#7c3aed',
          pink: '#ff0080',
          'pink-bright': '#ff33a1',
          'pink-dim': '#cc0066',
          blue: '#0080ff',
          'blue-bright': '#339fff',
          'blue-dim': '#0066cc',
          yellow: '#ffff00',
          'yellow-bright': '#ffff33',
          'yellow-dim': '#cccc00',
        }
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'terminal-glow': {
          '0%, 100%': { 
            textShadow: '0 0 10px rgba(0, 102, 255, 0.8), 0 0 20px rgba(0, 102, 255, 0.4)',
            boxShadow: '0 0 20px rgba(0, 102, 255, 0.3), 0 0 40px rgba(0, 102, 255, 0.1), inset 0 0 20px rgba(0, 102, 255, 0.05)'
          },
          '50%': { 
            textShadow: '0 0 15px rgba(0, 102, 255, 1), 0 0 30px rgba(0, 102, 255, 0.6)',
            boxShadow: '0 0 30px rgba(0, 102, 255, 0.5), 0 0 60px rgba(0, 102, 255, 0.2), inset 0 0 30px rgba(0, 102, 255, 0.1)'
          },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '41%': { opacity: '1' },
          '42%': { opacity: '0.8' },
          '43%': { opacity: '1' },
          '45%': { opacity: '0.9' },
          '46%': { opacity: '1' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'type': {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        'blink': {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'neon-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)',
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.8), 0 0 60px rgba(0, 255, 255, 0.5), inset 0 0 30px rgba(0, 255, 255, 0.2)',
          },
        },
        'swarm-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'hexagon-pulse': {
          '0%, 100%': { 
            opacity: '0.3',
            transform: 'scale(1)',
          },
          '50%': { 
            opacity: '0.6',
            transform: 'scale(1.05)',
          },
        },
        'neural-glow': {
          '0%, 100%': { 
            filter: 'brightness(1) drop-shadow(0 0 8px rgba(0, 255, 255, 0.5))',
          },
          '50%': { 
            filter: 'brightness(1.2) drop-shadow(0 0 16px rgba(0, 255, 255, 0.8))',
          },
        },
        'data-stream': {
          '0%': { 
            transform: 'translateX(-100%)',
            opacity: '0',
          },
          '50%': { 
            opacity: '1',
          },
          '100%': { 
            transform: 'translateX(100%)',
            opacity: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'terminal-glow': 'terminal-glow 2s ease-in-out infinite',
        'flicker': 'flicker 4s linear infinite',
        'scan': 'scan 8s linear infinite',
        'type': 'type 2s steps(40, end)',
        'blink': 'blink 1s step-end infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'swarm-float': 'swarm-float 3s ease-in-out infinite',
        'hexagon-pulse': 'hexagon-pulse 4s ease-in-out infinite',
        'neural-glow': 'neural-glow 2s ease-in-out infinite',
        'data-stream': 'data-stream 3s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
