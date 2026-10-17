/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Resolved from CSS variables set per theme in index.css via a
        // data-theme attribute, so class names (bg-espresso, text-ink/80...)
        // never change between themes - only what they point to does.
        espresso: {
          DEFAULT: 'rgb(var(--c-espresso) / <alpha-value>)',
          light: 'rgb(var(--c-espresso-light) / <alpha-value>)',
          dark: 'rgb(var(--c-espresso-dark) / <alpha-value>)',
        },
        buttercream: {
          DEFAULT: 'rgb(var(--c-buttercream) / <alpha-value>)',
          dark: 'rgb(var(--c-buttercream-dark) / <alpha-value>)',
          darker: 'rgb(var(--c-buttercream-darker) / <alpha-value>)',
        },
        flame: {
          DEFAULT: 'rgb(var(--c-flame) / <alpha-value>)',
          hot: 'rgb(var(--c-flame-hot) / <alpha-value>)',
          ember: 'rgb(var(--c-flame-ember) / <alpha-value>)',
        },
        gold: {
          DEFAULT: 'rgb(var(--c-gold) / <alpha-value>)',
          light: 'rgb(var(--c-gold-light) / <alpha-value>)',
        },
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        // Fixed (not themed): dark text for buttons on the amber flame color.
        onaccent: '#1C1613',
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px 6px rgba(255, 180, 84, 0.35)',
        goldglow: '0 0 30px 10px rgba(201, 166, 107, 0.45)',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { transform: 'scaleY(1) scaleX(1) rotate(0deg)' },
          '25%': { transform: 'scaleY(1.05) scaleX(0.97) rotate(-1.5deg)' },
          '50%': { transform: 'scaleY(0.96) scaleX(1.03) rotate(1deg)' },
          '75%': { transform: 'scaleY(1.03) scaleX(0.98) rotate(-0.5deg)' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(-2%, 1%)' },
        },
      },
      animation: {
        flicker: 'flicker 2.6s ease-in-out infinite',
        grain: 'grain 8s steps(10) infinite',
      },
    },
  },
  plugins: [],
};
