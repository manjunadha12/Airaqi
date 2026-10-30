module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand-base': '#06141B',
        'brand-card': '#11212D',
        slate: {
          950: '#06141B',
          900: '#11212D',
          850: '#162b3a',
          800: '#1c3447',
          700: '#25445c',
        },
        primary: '#3b82f6',
        secondary: '#06b6d4',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      borderRadius: {
        xl: '12px',
      },
      boxShadow: {
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
