/** @type {import('tailwindcss').Config} */

// Brand role colors are RGB channels in globals.css, so opacity modifiers (bg-primary/10) work
const role = name => `rgb(var(--${name}) / <alpha-value>)`

const config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: role('background'),
        foreground: role('foreground'),
        card: { DEFAULT: role('card'), foreground: role('card-foreground') },
        popover: { DEFAULT: role('popover'), foreground: role('popover-foreground') },
        primary: { DEFAULT: role('primary'), foreground: role('primary-foreground') },
        secondary: { DEFAULT: role('secondary'), foreground: role('secondary-foreground') },
        muted: { DEFAULT: role('muted'), foreground: role('muted-foreground') },
        accent: { DEFAULT: role('accent'), foreground: role('accent-foreground') },
        destructive: { DEFAULT: role('destructive'), foreground: role('destructive-foreground') },
        success: { DEFAULT: role('success'), foreground: role('success-foreground') },
        warning: { DEFAULT: role('warning'), foreground: role('warning-foreground') },
        border: role('border'),
        input: role('input'),
        ring: role('ring'),
        chart: {
          1: role('chart-1'),
          2: role('chart-2'),
          3: role('chart-3'),
          4: role('chart-4'),
          5: role('chart-5'),
        },
      },
      // Brand radius scale: 8, 12, 16, 20, full
      borderRadius: {
        DEFAULT: '8px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
      // Brand type scale (size / line height)
      fontSize: {
        xs: ['12px', '16px'], // caption
        sm: ['14px', '20px'], // small
        base: ['16px', '24px'], // body
        lg: ['18px', '28px'], // body large
        xl: ['22px', '30px'], // h3
        '3xl': ['28px', '36px'], // h2
        '4xl': ['36px', '44px'], // h1
        '5xl': ['44px', '52px'], // display
      },
    },
  },
}

export default config
