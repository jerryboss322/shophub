export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg:      '#FFFBF4',
        surface: '#FFFFFF',
        primary: '#111827',
        accent:  '#D4AF37',
        muted:   '#6B7280',
        success: '#22C55E',
        danger:  '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Geist', 'Inter', 'sans-serif'],
      },
      fontSize: {
        hero:    ['4rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'hero-lg':['4.5rem',{ lineHeight: '1.05', letterSpacing: '-0.03em' }],
        section: ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        xl:  '12px',
        '2xl':'16px',
        '3xl':'24px',
        '4xl':'32px',
      },
      boxShadow: {
        card:   '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 24px rgba(0,0,0,0.10)',
        glow:   '0 0 0 3px rgba(212,175,55,0.25)',
      },
      animation: {
        'fade-up':    'fadeUp 0.4s ease both',
        'fade-in':    'fadeIn 0.3s ease both',
        'slide-in':   'slideIn 0.35s ease both',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:    { from: { opacity:0, transform:'translateY(16px)' }, to: { opacity:1, transform:'none' } },
        fadeIn:    { from: { opacity:0 }, to: { opacity:1 } },
        slideIn:   { from: { opacity:0, transform:'translateX(-12px)' }, to: { opacity:1, transform:'none' } },
        pulseSoft: { '0%,100%': { opacity:1 }, '50%': { opacity:.5 } },
      },
    }
  },
  plugins: []
}
