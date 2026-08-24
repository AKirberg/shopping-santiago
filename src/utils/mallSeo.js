import { localizeMall } from "../i18n/mallContent";
import { mallMapsUrl } from "./maps";

const SITE_URL = "https://www.shopeando.cl";
const JSONLD_ID = "mall-jsonld";

const HOME_SEO = {
  es: {
    title: "Shopeando · Guía de malls y compras en Santiago de Chile",
    description: "Shopeando: encuentra el mejor mall, outlet o ruta de compras según tu ubicación, presupuesto y tiempo disponible. Guía para turistas en Santiago de Chile.",
    ogTitle: "Shopeando · Guía de malls en Santiago de Chile",
    ogDescription: "Encuentra el mejor mall, outlet o ruta de compras según tu ubicación y tiempo. Gratis, sin registro.",
    twitterTitle: "Shopeando · Guía de malls en Santiago",
    twitterDescription: "Encuentra el mejor mall según tu ubicación y tiempo. Guía turística de compras en Santiago de Chile.",
  },
  pt: {
    title: "Compras em Santiago: shoppings e outlets | Shopeando",
    description: "Planeje suas compras em Santiago do Chile: encontre shoppings, outlets e rotas perto de você. Guia gratuito em português para turistas brasileiros.",
    ogTitle: "Compras em Santiago do Chile | Shopeando",
    ogDescription: "Encontre shoppings, outlets e rotas de compras em Santiago. Gratuito, sem cadastro e em português.",
    twitterTitle: "Compras em Santiago do Chile | Shopeando",
    twitterDescription: "Guia de shoppings e outlets em Santiago para turistas brasileiros.",
  },
  en: {
    title: "Shopping in Santiago: malls and outlets | Shopeando",
    description: "Plan your shopping in Santiago, Chile: find malls, outlets and routes near you. A free guide for visitors.",
    ogTitle: "Shopping in Santiago, Chile | Shopeando",
    ogDescription: "Find malls, outlets and shopping routes in Santiago. Free and no sign-up required.",
    twitterTitle: "Shopping in Santiago, Chile | Shopeando",
    twitterDescription: "A free guide to malls and outlets in Santiago for visitors.",
  },
};

function setMeta(selector, attr, value) {
  const el = document.head.querySelector(selector);
  if (!el) return;
  if (value === null || value === undefined || value === "") {
    el.removeAttribute(attr);
    return;
  }
  el.setAttribute(attr, value);
}

/**
 * Returns canonical URL for a mall using /malls/:id or /outlets/:id.
 * No ?lang suffix — canonical URLs are language-neutral.
 */
export function mallUrl(mall) {
  const segment = mall.outlet ? "outlets" : "malls";
  return `${SITE_URL}/${segment}/${mall.id}/`;
}

export function buildMallJsonLd(mall) {
  const url = mallUrl(mall);
  if (mall.entityStatus === "integrated") {
    const parentUrl = `${SITE_URL}/malls/${mall.integratedInto}/`;
    const parent = {
      "@id": `${parentUrl}#shoppingcenter`,
      name: "Parque Arauco",
      url: parentUrl,
    };
    const webPage = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      name: mall.name,
      url,
      about: parent,
      isPartOf: parent,
    };
    if (mall.description) webPage.description = mall.description;
    if (mall.imageUrl) webPage.image = `${SITE_URL}${mall.imageUrl}`;
    return webPage;
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ShoppingCenter",
    "@id": `${url}#shoppingcenter`,
    name: mall.name,
    url,
    hasMap: mallMapsUrl(mall),
    isAccessibleForFree: true,
  };
  if (mall.description) jsonLd.description = mall.description;
  if (mall.commune) {
    jsonLd.address = {
      "@type": "PostalAddress",
      addressLocality: mall.commune,
      addressRegion: "Región Metropolitana",
      addressCountry: "CL",
    };
  }
  if (typeof mall.lat === "number" && typeof mall.lng === "number") {
    jsonLd.geo = { "@type": "GeoCoordinates", latitude: mall.lat, longitude: mall.lng };
  }
  if (mall.imageUrl) jsonLd.image = `${SITE_URL}${mall.imageUrl}`;
  if (mall.officialUrl) jsonLd.sameAs = [mall.officialUrl];
  const priceRanges = { alto: "$$$", medio: "$$", bajo: "$" };
  if (priceRanges[mall.priceLevel]) jsonLd.priceRange = priceRanges[mall.priceLevel];
  if (mall.stores?.length) {
    const stores = mall.stores.filter(store => store?.name).slice(0, 20).map(store => ({
      "@type": "Store",
      name: store.name,
    }));
    if (stores.length) jsonLd.containsPlace = stores;
  }
  return jsonLd;
}

export function applyMallSeo(mall, lang = "es") {
  const url = mallUrl(mall);
  // Canonical is always the clean URL without ?lang
  const canonicalUrl = url;
  const localizedMall = localizeMall(mall, lang);
  const titleSuffix = lang === "pt"
    ? "Lojas, horários e como chegar"
    : lang === "en"
      ? "Stores, hours and directions"
      : "Horarios, tiendas y cómo llegar";
  const title = `${mall.name} · ${titleSuffix} | Shopeando`;
  const description = mall.description ? (localizedMall.description || mall.description) : null;

  document.title = title;
  setMeta('meta[name="description"]', "content", description);
  setMeta('link[rel="canonical"]', "href", canonicalUrl);
  setMeta('meta[property="og:url"]', "content", canonicalUrl);
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

export function resetSeo(lang = "es") {
  const seo = HOME_SEO[lang] || HOME_SEO.es;
  // Home canonical is always clean — no ?lang suffix
  const localizedUrl = `${SITE_URL}/`;
  document.title = seo.title;
  setMeta('meta[name="description"]', "content", seo.description);
  setMeta('link[rel="canonical"]', "href", localizedUrl);
  setMeta('meta[property="og:url"]', "content", localizedUrl);
  setMeta('meta[property="og:title"]', "content", seo.ogTitle);
  setMeta('meta[property="og:description"]', "content", seo.ogDescription);
  setMeta('meta[property="og:image"]', "content", `${SITE_URL}/images/og-image.png`);
  setMeta('meta[name="twitter:title"]', "content", seo.twitterTitle);
  setMeta('meta[name="twitter:description"]', "content", seo.twitterDescription);
  setMeta('meta[name="twitter:image"]', "content", `${SITE_URL}/images/og-image.png`);
  document.getElementById(JSONLD_ID)?.remove();
}
