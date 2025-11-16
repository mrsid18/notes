import type { Config } from 'tailwindcss';
import nativewind from 'nativewind/preset';

const config: Config = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
    './providers/**/*.{js,jsx,ts,tsx}',
    './stores/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [nativewind],
  theme: {
    extend: {
      colors: {
        background: '#f7f7fb',
        foreground: '#0f172a',
        card: '#ffffff',
        'card-foreground': '#0f172a',
        popover: '#ffffff',
        'popover-foreground': '#0f172a',
        primary: {
          DEFAULT: '#3f37c9',
          foreground: '#f4f3ff',
        },
        secondary: {
          DEFAULT: '#eef2ff',
          foreground: '#1e1b4b',
        },
        muted: {
          DEFAULT: '#f5f5f7',
          foreground: '#6b7280',
        },
        accent: {
          DEFAULT: '#e0e7ff',
          foreground: '#111827',
        },
        destructive: {
          DEFAULT: '#dc2626',
          foreground: '#fef2f2',
        },
        border: '#e4e4ef',
        input: '#d5d9e3',
        ring: '#7c3aed',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
    },
  },
  plugins: [],
};

export default config;
