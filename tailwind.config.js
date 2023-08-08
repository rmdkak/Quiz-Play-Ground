/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    colors: {
      red: '#EB5353',
      hoverRed: '#EA8282',
      clickRed: '#B83535',
      yellow: '#F9D923',
      hoverYellow: '#FBE464',
      clickYellow: '#D6C045',
      green: '#36AE7C',
      hoverGreen: '#68CFA4',
      clickGreen: '#409370',
      blue: '#187498',
      hoverBlue: '#4A9EBE',
      clickBlue: '#1D5F79',
      skyblue: '#3AB4F2',
      clickSkyblue: '#4F9EC6',
      hoverSkyblue: '#82CDF4',
      gray1: '#F0F0F0',
      gray2: '#D9D9D9',
      gray3: '#9E9D9D',
      gray4: '#777777'
    },
    extend: {
      keyframes: {
        progress: {
          from: { width: '100%' },
          to: { width: '0%' }
        }
      },
      animation: {
        progress3: 'progress 3s ease-in forwards',
        progress5: 'progress 5s ease-in forwards',
        progress7: 'progress 7s ease-in forwards'
      }
    }
  },
  plugins: []
};
