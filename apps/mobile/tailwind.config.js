/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // iOS-inspired palette — single source of truth, no dark mode
        app: '#F2F2F7', // grouped background
        ink: '#000000', // primary text
        muted: '#6B7280', // secondary text
        subtle: '#9CA3AF', // tertiary text / icon
        line: '#E5E5EA', // separators / borders
        accent: '#007AFF', // iOS blue, primary action / link
        danger: '#FF3B30',
        warning: '#FF9500',
        success: '#34C759',
        forest: '#192B1B', // dark green hero backgrounds
        leaf: '#2A5C2A', // medium green CTAs
      },
    },
  },
  plugins: [],
}
