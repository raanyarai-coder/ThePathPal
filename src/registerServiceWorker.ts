export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    if (process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PathPal] ServiceWorker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('[PathPal] ServiceWorker registration failed:', error);
          });
      });
    } else {
      // In development mode, unregister any existing service worker to prevent caching vite bundles
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
    }
  }
}
