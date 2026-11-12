module.exports = {
  content: [
    './index.html',
    './assets/pages/**/*.html',
    './assets/js/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#102A4C', light: '#1B3B66' },
        royal: { DEFAULT: '#1D4F87', dark: '#153D6B' },
        teal: { DEFAULT: '#0B6865', dark: '#084F4D', light: '#E6F7F6' },
        surface: '#F1F5F9'
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
};
