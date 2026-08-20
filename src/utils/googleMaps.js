const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let loadPromise = null;

export function loadGoogleMaps() {
  if (loadPromise) return loadPromise;
  if (typeof window !== "undefined" && window.google?.maps?.places?.Place) {
    return Promise.resolve(window.google.maps);
  }
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    // v=beta enables AutocompleteSuggestion and the new Place API.
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&v=beta&language=es&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const startedAt = Date.now();
      const waitForPlaces = () => {
        if (window.google?.maps?.places?.Place) {
          resolve(window.google.maps);
        } else if (Date.now() - startedAt > 8000) {
          loadPromise = null;
          reject(new Error("Google Places did not finish loading"));
        } else {
          window.setTimeout(waitForPlaces, 50);
        }
      };
      waitForPlaces();
    };
    script.onerror = () => { loadPromise = null; reject(new Error("Google Maps failed to load")); };
    document.head.appendChild(script);
  });
  return loadPromise;
}
