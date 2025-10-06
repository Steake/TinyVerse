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
        dark: {
          'primary': '#7CB7E3',
          'secondary': '#9C7E90',
          'accent': '#3D79C9',
          'neutral': '#1a1f2e',
          'base-100': '#0f131a',
          'base-200': '#1a1f2e',
          'base-300': '#252b3a',
          'base-content': '#e4e6eb',
          'info': '#3ABFF8',
          'success': '#36D399',
          'warning': '#FBBD23',
          'error': '#F87272',
        },
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
    darkTheme: 'dark',
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: false,
    themeRoot: ":root"
  }
}