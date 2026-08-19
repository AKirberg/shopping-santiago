const GOOGLE_MAPS_DIRECTIONS = "https://www.google.com/maps/dir/";
const GOOGLE_MAPS_SEARCH = "https://www.google.com/maps/search/";

function hasCoordinates(place) {
  return Number.isFinite(place?.lat) && Number.isFinite(place?.lng);
}

function coordinatesFor(place) {
  return `${place.lat},${place.lng}`;
}

/**
 * Uses exact coordinates whenever they are available so that an ambiguous
 * shopping-centre name cannot send visitors to a different branch.
 */
export function mallMapsUrl(mall, origin) {
  if (hasCoordinates(mall)) {
    const params = new URLSearchParams({
      api: "1",
      destination: coordinatesFor(mall),
      travelmode: "driving",
    });

    if (origin?.lat != null && origin?.lng != null) {
      params.set("origin", `${origin.lat},${origin.lng}`);
    }

    return `${GOOGLE_MAPS_DIRECTIONS}?${params.toString()}`;
  }

  const query = mall?.mapsQuery || `${mall?.name || "Mall"} Santiago`;
  return `${GOOGLE_MAPS_SEARCH}?${new URLSearchParams({ api: "1", query }).toString()}`;
}

export function routeMapsUrl(stops, mallMap) {
  const malls = stops.map(stop => mallMap[stop.mallId]).filter(Boolean);
  if (malls.length === 0) return null;

  if (!malls.every(hasCoordinates)) return mallMapsUrl(malls[0]);

  const destination = malls[malls.length - 1];
  const params = new URLSearchParams({
    api: "1",
    destination: coordinatesFor(destination),
    travelmode: "driving",
  });

  if (malls.length > 1) {
    params.set("waypoints", malls.slice(0, -1).map(coordinatesFor).join("|"));
  }

  return `${GOOGLE_MAPS_DIRECTIONS}?${params.toString()}`;
}