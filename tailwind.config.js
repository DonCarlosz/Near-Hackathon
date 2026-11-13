/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#FAF7F0',
          100: '#F5EFE6',
          200: '#EFE9DC',
          300: '#E5DFC8',
          400: '#D8CFBC',
          500: '#C8BEAA'
        },
        near: {
          blue: '#0047FF',
          dark: '#111111',
          grid: '#D8CFBC',
          line: '#CDC4AF'
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
