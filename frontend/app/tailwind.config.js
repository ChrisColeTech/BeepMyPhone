/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          primary: '#3b82f6',   // Blue-500 (brighter for dark theme)
          secondary: '#64748b', // Slate-500
        },
        // Desktop app colors (dark theme)
        desktop: {
          // Title bar colors
          titlebar: {
            bg: '#1f2937',      // Gray-800
            border: '#374151',  // Gray-700
            text: '#e5e7eb',    // Gray-200
            icon: '#60a5fa',    // Blue-400
          },
          // Status bar colors
          statusbar: {
            bg: '#1f2937',      // Gray-800
            border: '#374151',  // Gray-700
            text: '#d1d5db',    // Gray-300
            muted: '#9ca3af',   // Gray-400
          },
          // Window controls
          controls: {
            button: '#374151',  // Gray-700
            hover: '#4b5563',   // Gray-600
            close: '#dc2626',   // Red-600
          },
        },
        // Light theme colors
        'desktop-light': {
          // Title bar colors
          titlebar: {
            bg: '#f3f4f6',      // Gray-100
            border: '#e5e7eb',  // Gray-200
            text: '#374151',    // Gray-700
            icon: '#3b82f6',    // Blue-500
          },
          // Status bar colors
          statusbar: {
            bg: '#f3f4f6',      // Gray-100
            border: '#e5e7eb',  // Gray-200
            text: '#374151',    // Gray-700
            muted: '#6b7280',   // Gray-500
          },
          // Window controls
          controls: {
            button: '#e5e7eb',  // Gray-200
            hover: '#d1d5db',   // Gray-300
            close: '#dc2626',   // Red-600
          },
        },
        // Semantic text colors using CSS custom properties
        text: {
          primary: 'var(--text-primary, #e5e7eb)',
          secondary: 'var(--text-secondary, #d1d5db)',
          muted: 'var(--text-muted, #9ca3af)',
          inverse: 'var(--text-inverse, #1f2937)',
        },
        // Background colors using CSS custom properties
        background: {
          app: 'var(--background-app, #111827)',
          card: 'var(--background-card, #1f2937)',
          elevated: 'var(--background-elevated, #374151)',
        },
        // Border colors using CSS custom properties
        border: {
          default: 'var(--border-default, #374151)',
          muted: 'var(--border-muted, #4b5563)',
        },
        // Status colors (theme-independent)
        status: {
          online: '#10b981',    // Green-500
          offline: '#ef4444',   // Red-500
          connecting: '#f59e0b', // Amber-500
          success: '#10b981',   // Green-500
          error: '#ef4444',     // Red-500
          warning: '#f59e0b',   // Amber-500
        },
        // Interactive colors using CSS custom properties
        interactive: {
          hover: 'var(--interactive-hover, #374151)',
          pressed: 'var(--interactive-pressed, #4b5563)',
        }
      },
      // Custom spacing if needed
      spacing: {
        '18': '4.5rem',
      }
    },
  },
  plugins: [],
}