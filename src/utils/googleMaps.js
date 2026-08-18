const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let loadPromise = null;

export function loadGoogleMaps() {
  if (typeof window !== "undefined" && window.google?.maps?.places) {
    return Promise.resolve(window.google.maps);
  }
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    // v=beta enables AutocompleteSuggestion (new Places API, replaces deprecated AutocompleteService)
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&v=beta&language=es&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => { loadPromise = null; reject(new Error("Google Maps failed to load")); };
    document.head.appendChild(script);
  });
  return loadPromise;
}
