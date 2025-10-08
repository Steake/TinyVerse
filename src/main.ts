import './app.css';
import App from './App.svelte';

// Note: Mock data initialization removed to prevent conflicts with existing backend data
// The backend already has persistent data that should be used instead

const app = new App({
  target: document.getElementById('app')!,
});

export default app;