export function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
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
  } else if ('serviceWorker' in navigator) {
    // Register in dev mode too for preview testing
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PathPal Dev] ServiceWorker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('[PathPal Dev] ServiceWorker registration failed:', error);
        });
    });
  }
}
