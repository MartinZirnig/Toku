module.exports = {
    theme: {
      extend: {
        keyframes: {
          fadeInSlide: {
            '0%': { opacity: '0', transform: 'translateY(-10px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          fadeOutSlide: {
            '0%': { opacity: '1', transform: 'translateY(0)' },
            '100%': { opacity: '0', transform: 'translateY(-10px)' },
          }
        },
        animation: {
          fadeInSlide: 'fadeInSlide 0.25s ease-out forwards',
          fadeOutSlide: 'fadeOutSlide 0.25s ease-out forwards'
        }
      }
    }
  }
  