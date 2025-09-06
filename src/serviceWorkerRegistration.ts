export function register() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .catch(err => {
          // eslint-disable-next-line no-console
          console.error("Service worker registration failed:", err);
        });
    });
  }
}