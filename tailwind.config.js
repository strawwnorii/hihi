/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        espresso: {
          DEFAULT: '#1C1613',
          light: '#2A211C',
          dark: '#120D0B',
        },
        buttercream: {
          DEFAULT: '#F6EDE0',
          dark: '#E4D3BD',
          darker: '#D3BE9E',
        },
        flame: {
          DEFAULT: '#FFB454',
          hot: '#FFDA9E',
          ember: '#E8823D',
        },
        gold: {
          DEFAULT: '#C9A66B',
          light: '#E3C892',
        },
        ink: '#F3EAD9',
        muted: '#B7A996',
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
