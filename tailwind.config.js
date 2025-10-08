/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'primary': 'var(--color-accent-primary)',
        'secondary': 'var(--color-accent-secondary)',
        'accent': 'var(--color-accent-primary)',
        'neutral': 'var(--color-bg-secondary)',
        'base-100': 'var(--color-bg-primary)',
        'base-200': 'var(--color-bg-secondary)',
        'base-300': 'var(--color-bg-tertiary)',
        'base-content': 'var(--color-text-primary)',
        'success': 'var(--color-accent-success)',
        'warning': 'var(--color-accent-warning)',
        'error': 'var(--color-accent-danger)',
        'danger': 'var(--color-accent-danger)',
        'info': 'var(--color-accent-info)',
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
  plugins: [],
};
