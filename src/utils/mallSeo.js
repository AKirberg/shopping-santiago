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
    hasMap: mallMapsUrl(mall),
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

export function applyMallSeo(mall, lang = "es") {
  const url = mallUrl(mall);
  const canonicalUrl = lang === "es" ? url : `${url}?lang=${lang}`;
  const localizedMall = localizeMall(mall, lang);
  const titleSuffix = lang === "pt"
    ? "Lojas, horários e como chegar"
    : lang === "en"
      ? "Stores, hours and directions"
      : "Horarios, tiendas y cómo llegar";
  const title = `${mall.name} · ${titleSuffix} | Shopeando`;
  const description = localizedMall.description || mall.description;

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
  const localizedUrl = lang === "es" ? `${SITE_URL}/` : `${SITE_URL}/?lang=${lang}`;
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
