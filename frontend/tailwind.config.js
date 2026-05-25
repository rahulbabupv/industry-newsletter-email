/** @type {import('tailwindcss').Config} */
export default {
  // Tell Tailwind which files to scan so it only ships the CSS classes you use
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // Premium Magazine Color Palette
      colors: {
        magazine: {
          bg: '#FDFBF7',       // Premium off-white matte paper background
          primary: '#064e3b',  // Deep emerald green accent for headers/branding
          text: '#111827',     // Crisp, high-contrast dark charcoal for ultimate readability
          muted: '#4b5563',    // Soft gray for metadata and issue dates
          border: '#e5e7eb',   // Clean, thin separator line color
        },
      },
      // Editorial Typography Configurations
      fontFamily: {
        headline: ['Merriweather', 'serif'], // Commanding serif for headlines and titles
        body: ['Inter', 'sans-serif'],       // Clean, high-readability sans-serif for body text
      },
      // Premium Editorial Details (Fine-tuning typography spacing)
      letterSpacing: {
        editorial: '-0.02em', // Tightens headline tracking slightly for an international print look
        meta: '0.05em',       // Opens up tracking for small headers, dates, and category tags
      },
      lineHeight: {
        relaxed: '1.65',       // Perfect readability spacing for long-form multi-column text
      }
    },
  },
  plugins: [],
};