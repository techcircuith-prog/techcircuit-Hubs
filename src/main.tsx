import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// PWA service worker handling.
// Production: register the service worker for offline support.
// Development: actively unregister any previously-registered service worker and
// clear its caches, so a stale cache-first worker can never mask local changes.
if ('serviceWorker' in navigator) {
  if (process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration failed: ', err);
      });
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    }).catch(() => {});
    if (typeof caches !== 'undefined') {
      caches.keys().then((keys) =>
        Promise.all(keys.map((key) => caches.delete(key)))
      ).catch(() => {});
    }
  }
}

createRoot(document.getElementById('root')!).render(<App />);

