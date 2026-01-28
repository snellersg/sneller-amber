/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Font families mapped to Sneller 2026 typography
      fontFamily: {
        'heading': ['var(--font-heading)', 'Roboto', 'system-ui', 'sans-serif'],
        'sans': ['var(--font-sans)', 'Nunito Sans', 'system-ui', 'sans-serif'],
      },
      
      // 8pt spacing system (4, 8, 12, 16, 24, 32, 48, 64)
      spacing: {
        '1': '4px',   // 4pt
        '2': '8px',   // 8pt  
        '3': '12px',  // 12pt
        '4': '16px',  // 16pt
        '6': '24px',  // 24pt
        '8': '32px',  // 32pt
        '12': '48px', // 48pt
        '16': '64px', // 64pt
        // Keep existing Tailwind defaults for other values
        '0': '0px',
        'px': '1px',
        '0.5': '2px',
        '1.5': '6px',
        '2.5': '10px',
        '3.5': '14px',
        '5': '20px',
        '7': '28px',
        '9': '36px',
        '10': '40px',
        '11': '44px',
        '14': '56px',
        '20': '80px',
        '24': '96px',
        '28': '112px',
        '32': '128px',
        '36': '144px',
        '40': '160px',
        '44': '176px',
        '48': '192px',
        '52': '208px',
        '56': '224px',
        '60': '240px',
        '64': '256px',
        '72': '288px',
        '80': '320px',
        '96': '384px',
      },
      
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        // Expose brand colors directly for special cases
        sneller: {
          blue: 'hsl(var(--sneller-blue))',
          'rock-salt': 'hsl(var(--rock-salt))',
          'midnight-asphalt': 'hsl(var(--midnight-asphalt))',
          'storm-charcoal': 'hsl(var(--storm-charcoal))',
          'steel-blade': 'hsl(var(--steel-blade))',
          'winter-frost': 'hsl(var(--winter-frost))',
          'snow-drift': 'hsl(var(--snow-drift))',
          'blizzard-white': 'hsl(var(--blizzard-white))',
        },
      },
      
      // Sneller 2026 radius system: sm=8, md=12, lg=16
      borderRadius: {
        'sm': '8px',
        'md': '12px', 
        'lg': '16px',
        'xl': '20px', // Keep for special cases
        // Keep Tailwind defaults
        'none': '0px',
        '': '4px', // default
        'full': '9999px',
      },
      
      // Type scale matching Sneller 2026
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],     // 12/16
        'sm': ['14px', { lineHeight: '20px' }],     // 14/20

        'base': ['16px', { lineHeight: '24px' }],   // 16/24
        'lg': ['18px', { lineHeight: '28px' }],     // 18/28
        'xl': ['22px', { lineHeight: '30px' }],     // h3: 22/30
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['28px', { lineHeight: '36px' }],    // h2: 28/36
        '4xl': ['36px', { lineHeight: '44px' }],    // h1: 36/44
        '5xl': ['44px', { lineHeight: '52px' }],    // display: 44/52
        '6xl': ['48px', { lineHeight: '1' }],
        '7xl': ['72px', { lineHeight: '1' }],
        '8xl': ['96px', { lineHeight: '1' }],
        '9xl': ['128px', { lineHeight: '1' }],
      },
    },
  },
  plugins: [],
}