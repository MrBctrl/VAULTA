/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primary
        navy: {
          DEFAULT: '#0B2545',
          50: '#EAF0FA',
          100: '#CBDAF0',
          400: '#3E5D8C',
          600: '#0B2545',
          700: '#081C36',
          900: '#050F1E',
        },
        // Secondary
        electric: {
          DEFAULT: '#2F6FED',
          50: '#EAF1FE',
          100: '#D3E2FD',
          500: '#2F6FED',
          600: '#1F56C9',
        },
        slate: {
          DEFAULT: '#64748B',
          50: '#F5F7FA',
          100: '#E7EBF1',
          400: '#8C99AC',
          600: '#4C5B71',
        },
        silver: {
          DEFAULT: '#E2E8F0',
          light: '#F4F6F9',
        },
        // Status
        success: '#10B981',
        warning: '#F59E0B',
        error: '#DC2626',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },
      borderRadius: {
        card: '20px',
        button: '14px',
        input: '14px',
        chart: '18px',
      },
      boxShadow: {
        surface: '0 1px 2px 0 rgba(11, 37, 69, 0.06)',
        elevated: '0 8px 24px -4px rgba(11, 37, 69, 0.12)',
        modal: '0 24px 64px -12px rgba(11, 37, 69, 0.28)',
      },
      maxWidth: {
        content: '1280px',
      },
    },
  },
  plugins: [],
}
