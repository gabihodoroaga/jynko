/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          app: '#ffffff',
          subtle: '#f8fafc', // slate-50
        },
        surface: {
          card: '#ffffff',
          hover: '#f1f5f9', // slate-100
        },
        border: {
          subtle: '#e2e8f0', // slate-200
          strong: '#cbd5e1', // slate-300
        },
        brand: {
          DEFAULT: '#0284c7', // sky-600 / primary blue CTA
          hover: '#0369a1',   // sky-700
        },
        status: {
          backlog: { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' },
          todo: { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' },
          progress: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
          review: { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' },
          completed: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
          cancelled: { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
};
