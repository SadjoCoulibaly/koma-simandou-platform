/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ── Legacy (conservés) ── */
        ink:        '#0A1628',
        pine:       '#0D1B2E',
        'pine-2':   '#091624',
        'pine-3':   '#071120',
        bone:       '#F5F6F9',
        'bone-2':   '#E8ECF2',
        paper:      '#FFFFFF',
        gold:       '#C49A45',
        'gold-deep':'#9A7820',
        'gold-soft':'#DDB96A',
        rust:       '#B23A2E',
        'rust-deep':'#8E2A20',
        leaf:       '#1C7A4D',

        /* ── KOMA Design System ── */
        'koma-teal':       '#00798C',
        'koma-teal-dark':  '#00263B',
        'koma-teal-light': '#EBFCFF',
        'koma-red':        '#D63E44',
        'koma-red-hover':  '#C50000',
        'koma-pink':       '#FFF6F7',
        'koma-text':       '#2A2A2F',
        'koma-border':     '#757580',
        'koma-gray':       '#F3F4F6',
      },
      fontFamily: {
        sans:    ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        heading: ['Raleway', 'sans-serif'],
        archivo: ['Archivo', 'sans-serif'],
        serif:   ['Fraunces', 'Georgia', 'Times New Roman', 'serif'],
      },
      borderRadius: {
        pill: '50px',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(120% 130% at 80% -10%, #0D1B2E 0%, #091624 45%, #071120 100%)',
        'teal-gradient': 'linear-gradient(135deg, #00798C 0%, #00263B 100%)',
      },
      boxShadow: {
        hero:  '0 24px 60px -28px rgba(13,27,46,.45)',
        card:  '0 2px 12px rgba(0,0,0,.07)',
        'card-md': '0 8px 32px rgba(0,0,0,.12)',
        rust:  '0 10px 24px -12px rgba(178,58,46,.8)',
        teal:  '0 8px 24px rgba(0,121,140,.3)',
      },
      animation: {
        'rise':    'rise 0.9s cubic-bezier(.16,1,.3,1) backwards',
        'fade-up': 'fadeUp 0.8s cubic-bezier(.16,1,.3,1) both',
      },
      keyframes: {
        rise:    { from: { opacity: '0', transform: 'translateY(28px)' }, to: { opacity: '1', transform: 'none' } },
        fadeUp:  { from: { opacity: '0', transform: 'translateY(26px)' }, to: { opacity: '1', transform: 'none' } },
      },
    },
  },
  plugins: [],
}
