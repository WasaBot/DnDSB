// This service worker will cache all static assets and spell API responses for offline use.

const CACHE_NAME = "dnd-spellbook-v1";
const SPELL_API_PREFIX = "https://www.dnd5eapi.co/api/spells/";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/logo192.png",
  "/logo512.png",
  "/static/js/bundle.js",
  "/static/js/main.chunk.js",
  "/static/js/0.chunk.js",
  "/static/css/main.css",
  // Add more static files if your build outputs them
  // You may need to adjust these paths based on your build tool (CRA, Vite, etc.)
];

// Register the service worker (call this from index.tsx)
export function register() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(err => {
          // eslint-disable-next-line no-console
          console.error("Service worker registration failed:", err);
        });
    });
  }
}