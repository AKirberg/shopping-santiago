const SITE_URL = "https://www.shopeando.cl";
const JSONLD_ID = "mall-jsonld";

const DEFAULT_TITLE = "Shopeando · Guía de malls y compras en Santiago de Chile";
const DEFAULT_DESCRIPTION =
  "Shopeando: encuentra el mejor mall, outlet o ruta de compras según tu ubicación, presupuesto y tiempo disponible. Guía para turistas en Santiago de Chile.";

function setMeta(selector, attr, value) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

export function mallUrl(mall) {
  return `${SITE_URL}/mall/${mall.id}`;
}

export function buildMallJsonLd(mall) {
  const url = mallUrl(mall);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ShoppingCenter",
    "@id": `${url}#shoppingcenter`,
    name: mall.name,
    description: mall.description,
    url,
    address: {
      "@type": "PostalAddress",
      addressLocality: mall.commune,
      addressRegion: "Región Metropolitana",
      addressCountry: "CL",
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mall.mapsQuery || `${mall.name} Santiago`)}`,
    isAccessibleForFree: true,
  };
  if (typeof mall.lat === "number" && typeof mall.lng === "number") {
    jsonLd.geo = { "@type": "GeoCoordinates", latitude: mall.lat, longitude: mall.lng };
  }
  if (mall.imageUrl) jsonLd.image = `${SITE_URL}${mall.imageUrl}`;
  if (mall.officialUrl) jsonLd.sameAs = [mall.officialUrl];
  if (mall.priceLevel) {
    jsonLd.priceRange = mall.priceLevel === "alto" ? "$$$" : mall.priceLevel === "medio" ? "$$" : "$";
  }
  if (mall.stores?.length) {
    jsonLd.containsPlace = mall.stores.slice(0, 20).map(store => ({
      "@type": "Store",
      name: store.name,
    }));
  }
  return jsonLd;
}

export function applyMallSeo(mall) {
  const url = mallUrl(mall);
  const title = `${mall.name} · Horarios, tiendas y cómo llegar | Shopeando`;
  const description = mall.description;

  document.title = title;
  setMeta('meta[name="description"]', "content", description);
  setMeta('link[rel="canonical"]', "href", url);
  setMeta('meta[property="og:url"]', "content", url);
  setMeta('meta[property="og:title"]', "content", title);
  setMeta('meta[property="og:description"]', "content", description);
  if (mall.imageUrl) setMeta('meta[property="og:image"]', "content", `${SITE_URL}${mall.imageUrl}`);
  setMeta('meta[name="twitter:title"]', "content", title);
  setMeta('meta[name="twitter:description"]', "content", description);
  if (mall.imageUrl) setMeta('meta[name="twitter:image"]', "content", `${SITE_URL}${mall.imageUrl}`);

  let script = document.getElementById(JSONLD_ID);
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = JSONLD_ID;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(buildMallJsonLd(mall));
}

export function resetSeo() {
  document.title = DEFAULT_TITLE;
  setMeta('meta[name="description"]', "content", DEFAULT_DESCRIPTION);
  setMeta('link[rel="canonical"]', "href", `${SITE_URL}/`);
  setMeta('meta[property="og:url"]', "content", `${SITE_URL}/`);
  setMeta('meta[property="og:title"]', "content", "Shopeando · Guía de malls en Santiago de Chile");
  setMeta('meta[property="og:description"]', "content", "Encuentra el mejor mall, outlet o ruta de compras según tu ubicación y tiempo. Gratis, sin registro.");
  setMeta('meta[property="og:image"]', "content", `${SITE_URL}/images/og-image.png`);
  setMeta('meta[name="twitter:title"]', "content", "Shopeando · Guía de malls en Santiago");
  setMeta('meta[name="twitter:description"]', "content", "Encuentra el mejor mall según tu ubicación y tiempo. Guía turística de compras en Santiago de Chile.");
  setMeta('meta[name="twitter:image"]', "content", `${SITE_URL}/images/og-image.png`);
  document.getElementById(JSONLD_ID)?.remove();
}
