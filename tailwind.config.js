/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'primary': '#2563EB', // Deep blue (primary) - blue-600
        'primary-50': '#EFF6FF', // Very light blue (50-level shade) - blue-50
        'primary-100': '#DBEAFE', // Light blue (100-level shade) - blue-100
        'primary-500': '#3B82F6', // Medium blue (500-level shade) - blue-500
        'primary-700': '#1D4ED8', // Dark blue (700-level shade) - blue-700
        'primary-900': '#1E3A8A', // Very dark blue (900-level shade) - blue-900

        // Secondary Colors
        'secondary': '#64748B', // Sophisticated slate (secondary) - slate-500
        'secondary-100': '#F1F5F9', // Light slate (100-level shade) - slate-100
        'secondary-200': '#E2E8F0', // Light slate (200-level shade) - slate-200
        'secondary-300': '#CBD5E1', // Medium light slate (300-level shade) - slate-300
        'secondary-600': '#475569', // Medium dark slate (600-level shade) - slate-600
        'secondary-700': '#334155', // Dark slate (700-level shade) - slate-700

        // Accent Colors
        'accent': '#0EA5E9', // Lighter blue (accent) - sky-500
        'accent-100': '#E0F2FE', // Light sky (100-level shade) - sky-100
        'accent-500': '#0EA5E9', // Medium sky (500-level shade) - sky-500
        'accent-600': '#0284C7', // Dark sky (600-level shade) - sky-600

        // Background Colors
        'background': '#FAFAFA', // Warm off-white (background) - neutral-50
        'surface': '#FFFFFF', // Pure white (surface) - white

        // Text Colors
        'text-primary': '#1E293B', // Near-black with blue undertone (text primary) - slate-800
        'text-secondary': '#64748B', // Medium gray (text secondary) - slate-500

        // Status Colors
        'success': '#059669', // Professional green (success) - emerald-600
        'success-100': '#D1FAE5', // Light green (100-level shade) - emerald-100
        'success-500': '#10B981', // Medium green (500-level shade) - emerald-500

        'warning': '#D97706', // Warm amber (warning) - amber-600
        'warning-100': '#FEF3C7', // Light amber (100-level shade) - amber-100
        'warning-500': '#F59E0B', // Medium amber (500-level shade) - amber-500

        'error': '#DC2626', // Clear red (error) - red-600
        'error-100': '#FEE2E2', // Light red (100-level shade) - red-100
        'error-500': '#EF4444', // Medium red (500-level shade) - red-500

        // Border Colors
        'border': '#E2E8F0', // Minimal border color - slate-200
        'border-focus': '#2563EB', // Focus border color - blue-600
      },
      fontFamily: {
        'heading': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'caption': ['Inter', 'system-ui', 'sans-serif'],
        'data': ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      fontWeight: {
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'skeleton': 'skeleton-loading 1.5s ease-in-out infinite',
        'toast-slide': 'toast-slide-in 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        'micro-scale': 'micro-scale 200ms ease-out',
      },
      keyframes: {
        'skeleton-loading': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'toast-slide-in': {
          'from': { 
            transform: 'translateX(100%)',
            opacity: '0'
          },
          'to': { 
            transform: 'translateX(0)',
            opacity: '1'
          },
        },
        'micro-scale': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
      },
      zIndex: {
        'header': '1000',
        'dropdown': '1010',
        'sidebar': '1005',
        'mobile-menu': '1020',
        'modal': '1030',
        'overlay': '1025',
      },
      boxShadow: {
        'elevation-1': '0 2px 4px rgba(0, 0, 0, 0.05)',
        'elevation-2': '0 4px 8px rgba(0, 0, 0, 0.08)',
        'elevation-3': '0 8px 16px rgba(0, 0, 0, 0.1)',
        'elevation-4': '0 16px 24px rgba(0, 0, 0, 0.12)',
        'elevation-5': '0 24px 32px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}