/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'primary': '#7CB7E3',
        'secondary': '#9C7E90',
        'accent': '#3D79C9',
        'neutral': '#14202C',
        'base-100': '#F6F9FA',
        'base-200': '#E6EEF2',
        'base-300': '#D6E3EA',
        'base-content': '#14202C',
      },
      strokeWidth: {
        '4': '4px'
      },
      brightness: {
        '110': '1.1',
        '120': '1.2'
      }
    }
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          'primary': '#7CB7E3',
          'secondary': '#9C7E90',
          'accent': '#3D79C9',
          'neutral': '#14202C',
          'base-100': '#F6F9FA',
          'base-200': '#E6EEF2',
          'base-300': '#D6E3EA',
          'base-content': '#14202C',
        }
      }
    ],
    darkTheme: 'light',
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: false,
    themeRoot: ":root"
  }
}