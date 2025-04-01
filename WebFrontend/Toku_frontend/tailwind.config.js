module.exports = {
  content: [
    './src/**/*.{html,ts}', // Ensure all relevant files are included
  ],
  theme: {
    extend: {
      backdropBlur: {
        'none': 'none',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
  ],
};
