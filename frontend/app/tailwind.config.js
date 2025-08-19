/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          primary: '#2563eb',   // Blue-600
          secondary: '#64748b', // Slate-500
        },
        // Semantic text colors
        text: {
          primary: '#0f172a',   // Main headings - slate-900
          secondary: '#475569', // Descriptions - slate-600  
          muted: '#64748b',     // Less important - slate-500
          inverse: '#f8fafc',   // White text on dark backgrounds
        },
        // Background colors
        background: {
          app: '#f8fafc',       // App background - slate-50
          card: '#ffffff',      // Card/panel backgrounds
          elevated: '#f1f5f9',  // Slightly elevated surfaces - slate-100
        },
        // Border colors
        border: {
          default: '#e2e8f0',   // Standard borders - slate-200
          muted: '#f1f5f9',     // Subtle borders - slate-100
        },
        // Status colors
        status: {
          online: '#10b981',    // Green-500
          offline: '#ef4444',   // Red-500
          connecting: '#f59e0b', // Amber-500
        },
        // Interactive colors
        interactive: {
          hover: '#f1f5f9',     // Hover states - slate-100
          pressed: '#e2e8f0',   // Pressed states - slate-200
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
