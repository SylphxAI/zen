/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
          light: '#818cf8',
        },
        secondary: '#8b5cf6',
        bg: {
          DEFAULT: '#ffffff',
          light: '#f9fafb',
          lighter: '#f3f4f6',
          dark: {
            DEFAULT: '#0a0a0a',
            light: '#1a1a1a',
            lighter: '#2a2a2a',
          },
        },
        text: {
          DEFAULT: '#111827',
          muted: '#6b7280',
          dark: {
            DEFAULT: '#ffffff',
            muted: '#a0a0a0',
          },
        },
        border: {
          DEFAULT: '#e5e7eb',
          dark: '#333',
        },
        success: '#10b981',
      },
      borderRadius: {
        'zen': '12px',
      },
      boxShadow: {
        'zen': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
