const CACHE_NAME = "dnd-spellbook-v1";
const SPELL_API_PREFIX = "https://www.dnd5eapi.co/api/spells/";

const STATIC_ASSETS = [
  "/",
  "/asset-manifest.json",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/logo192.png",
  "/logo512.png",
  "/static/js/bundle.js",
  "/static/js/main.js",
  "/static/js/main.chunk.js",
  "/static/js/0.chunk.js",
  "/static/css/main.css",
];

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