/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,ts,tsx}',
  ],

  presets: [require('nativewind/preset')],

  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B00', // Main orange
          light: '#FFA24D',   // Hover/active state
          dark: '#E05A00',    // Darker for hover on dark theme
        },
        background: {
          light: '#F9FAFB',
          DEFAULT: '#FFFFFF',
          dark: '#1A1A1A',
        },
        text: {
          DEFAULT: '#111827',     // Neutral gray-blue
          muted: '#6B7280',       // Muted subtitle
          light: '#E5E7EB',       // Text on dark background
        },
        surface: {
          light: '#FFFFFF',
          dark: '#2C2C2C',        // Cards in dark mode
        },
        success: '#22C55E',       // Green tags (e.g. "Snack")
        warning: '#FACC15',       // Yellow tags (e.g. "Breakfast")
        error: '#EF4444',         // For future error states
        rating: '#F59E0B',        // Star color
      },
    },
  },
  plugins: [],
};
