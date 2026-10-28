module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6f8',
          100: '#d4eaef',
          200: '#acd5df',
          300: '#78b8c8',
          400: '#4696ab',
          500: '#2c7a90',
          600: '#226378',
          700: '#1d5163',
          800: '#1b4453',
          900: '#183946',
          950: '#0d2530',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          400: '#fb923c',
          500: '#ea580c',
          600: '#c2410c',
          700: '#9a3412',
        },
        ink: {
          DEFAULT: '#1a2530',
          muted: '#45525e',
        },
        canvas: '#f7f5f1',
      },
      fontFamily: {
        sans: [
          '"Atkinson Hyperlegible"',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 37, 48, 0.06), 0 4px 16px rgba(16, 37, 48, 0.06)',
        lift: '0 2px 4px rgba(16, 37, 48, 0.08), 0 12px 32px rgba(16, 37, 48, 0.10)',
      },
      maxWidth: {
        page: '72rem',
      },
    },
  },
  plugins: [],
};
