import { createPreset } from 'fumadocs-ui/tailwind-plugin'

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  presets: [createPreset()],
  content: [
    './node_modules/fumadocs-ui/dist/**/*.js',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
