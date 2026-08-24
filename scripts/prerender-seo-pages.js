#!/usr/bin/env node
/**
 * prerender-seo-pages.js
 * Post-build script: generates all SEO-prerendered HTML pages in dist/.
 *
 * Generates:
 *   dist/malls/:id/index.html          — ShoppingCenter JSON-LD (25 non-outlet malls)
 *   dist/outlets/:id/index.html        — ShoppingCenter JSON-LD (2 outlets)
 *   dist/malls/index.html              — ItemList index
 *   dist/outlets/index.html            — ItemList index
 *   dist/rutas/:id/index.html          — ItemList JSON-LD per route
 *   dist/rutas/index.html              — ItemList index
 *   dist/guias/:id/index.html          — Article JSON-LD
 *   dist/guias/index.html              — WebPage index
 *   dist/comparar/:id/index.html       — WebPage+ItemList JSON-LD
 *   dist/comparar/index.html           — WebPage index
 *   dist/mall/:id/index.html           — noindex redirect → /malls/:id or /outlets/:id (legacy)
 *
 * React mounts into #root and replaces the pre-rendered content for interactive visits.
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { alternateLinkTags, localizedCopy, localizedPath, PUBLIC_LOCALES } from "../src/utils/publicLocales.js";
import { localizeMall } from "../src/i18n/mallContent.js";
import { localizeRoute } from "../src/i18n/routeContent.js";
import { localizeGuide } from "../src/i18n/guideContent.js";
import { localizeComparison } from "../src/i18n/comparisonContent.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SITE_URL = "https://www.shopeando.cl";

// ── load data ──────────────────────────────────────────────────────────────

const malls = JSON.parse(readFileSync(resolve(ROOT, "src/data/malls.json"), "utf-8"));
const routes = JSON.parse(readFileSync(resolve(ROOT, "src/data/routes.json"), "utf-8"));
const guides = JSON.parse(readFileSync(resolve(ROOT, "src/data/guides.json"), "utf-8"));
const comparisons = JSON.parse(readFileSync(resolve(ROOT, "src/data/comparisons.json"), "utf-8"));

const isStandaloneMall = (mall) => mall?.entityStatus !== "integrated";
const mallPages = malls.filter((m) => !m.outlet);
const outletPages = malls.filter((m) => m.outlet);
const standaloneMallPages = mallPages.filter(isStandaloneMall);
const standaloneOutletPages = outletPages.filter(isStandaloneMall);
const mallById = Object.fromEntries(malls.map((m) => [m.id, m]));

// ── load dist template ──────────────────────────────────────────────────────

const distIndex = resolve(ROOT, "dist/index.html");
let template;
try {
  template = readFileSync(distIndex, "utf-8");
} catch {
  console.error("❌ dist/index.html not found — run `vite build` first.");
  process.exit(1);
}

// ── helpers ────────────────────────────────────────────────────────────────

function escHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
const escAttr = escHtml;

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function canonicalUrl(path) {
  return `${SITE_URL}${path.endsWith("/") ? path : path + "/"}`;
}

function mallCanonicalPath(mall) {
  return mall.outlet ? `/outlets/${mall.id}/` : `/malls/${mall.id}/`;
}

function coordinatesFor(mall) {
  return `${mall.lat},${mall.lng}`;
}

function mallMapsUrl(mall) {
  if (Number.isFinite(mall?.lat) && Number.isFinite(mall?.lng)) {
    const params = new URLSearchParams({
      api: "1",
      destination: coordinatesFor(mall),
      travelmode: "driving",
    });
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  const query = mall?.mapsQuery || `${mall?.name || "Mall"} Santiago`;
  return `https://www.google.com/maps/search/?${new URLSearchParams({ api: "1", query }).toString()}`;
}

function routeMapsUrl(route) {
  const routeMalls = (route.stops || []).map((stop) => mallById[stop.mallId]).filter(isStandaloneMall);
  if (!routeMalls.length) return null;
  if (!routeMalls.every((mall) => Number.isFinite(mall.lat) && Number.isFinite(mall.lng))) {
    return mallMapsUrl(routeMalls[0]);
  }

  const params = new URLSearchParams({
    api: "1",
    destination: coordinatesFor(routeMalls[routeMalls.length - 1]),
    travelmode: "driving",
  });
  if (routeMalls.length > 1) {
    params.set("waypoints", routeMalls.slice(0, -1).map(coordinatesFor).join("|"));
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

// ── HTML head manipulation ─────────────────────────────────────────────────

function replaceTitle(html, title) {
  return html.replace(/<title>[^<]*<\/title>/, `<title>${escAttr(title)}</title>`);
}

function setMetaContent(html, selector, value) {
  const re = new RegExp(
    `(<(?:meta|link)[^>]*${escapeRe(selector)}[^>]*(?:content|href)=)["']([^"']*)["']`,
    "i"
  );
  return html.replace(re, `$1"${escAttr(value)}"`);
}

function injectNoIndex(html) {
  if (html.includes('name="robots"')) {
    return html.replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex,nofollow" />');
  }
  return html.replace("</head>", '  <meta name="robots" content="noindex,nofollow" />\n  </head>');
}

function replaceJsonLd(html, jsonLd) {
  const stripped = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, "");
  const injection = `\n    <script type="application/ld+json">\n    ${JSON.stringify(jsonLd, null, 2).replace(/\n/g, "\n    ")}\n    </script>`;
  return stripped.replace("</head>", `${injection}\n  </head>`);
}

function replaceBody(html, bodyContent) {
  return html.replace(/<body>[\s\S]*?<\/body>/, `<body>\n${bodyContent}\n  </body>`);
}

function stripHomeHreflang(html) {
  return html.replace(/\s*<link\b[^>]*\bhreflang=["'][^"']+["'][^>]*>\s*/gi, "\n");
}

function addMetaRefresh(html, targetUrl) {
  const tag = `<meta http-equiv="refresh" content="0;url=${escAttr(targetUrl)}" />`;
  return html.replace("</head>", `  ${tag}\n  </head>`);
}

function buildHead(opts) {
  const { html: base, title, description, canonical, ogImage, noindex, jsonLd, metaRefreshUrl } = opts;
  let html = stripHomeHreflang(base);
  html = replaceTitle(html, title);
  if (description) {
    html = setMetaContent(html, 'name="description"', description);
    html = setMetaContent(html, 'property="og:description"', description);
    html = setMetaContent(html, 'name="twitter:description"', description);
  } else {
    html = html
      .replace(/\s*<meta[^>]*name=["']description["'][^>]*>/i, "")
      .replace(/\s*<meta[^>]*property=["']og:description["'][^>]*>/i, "")
      .replace(/\s*<meta[^>]*name=["']twitter:description["'][^>]*>/i, "");
  }
  html = setMetaContent(html, 'rel="canonical"', canonical);
  html = setMetaContent(html, 'property="og:url"', canonical);
  html = setMetaContent(html, 'property="og:title"', title);
  html = setMetaContent(html, 'property="og:image"', ogImage);
  html = setMetaContent(html, 'name="twitter:title"', title);
  html = setMetaContent(html, 'name="twitter:image"', ogImage);
  if (jsonLd) html = replaceJsonLd(html, jsonLd);
  if (noindex) html = injectNoIndex(html);
  if (metaRefreshUrl) html = addMetaRefresh(html, metaRefreshUrl);
  if (!noindex) {
    const path = new URL(canonical).pathname.replace(/^\/(pt-br|en)(?=\/|$)/, "") || "/";
    const locale = canonical.includes("/pt-br/") ? "pt-BR" : canonical.includes("/en/") ? "en" : "es-CL";
    html = html.replace(/<html\b[^>]*\blang=["'][^"']+["']/, `<html lang="${locale}"`);
    html = html.replace("</head>", `    ${alternateLinkTags(SITE_URL, path)}\n  </head>`);
  }
  return html;
}

// ── breadcrumb helpers ─────────────────────────────────────────────────────

function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function pageGraphJsonLd(primaryEntity, breadcrumbItems) {
  const { "@context": _primaryContext, ...primaryNode } = primaryEntity;
  const { "@context": _breadcrumbContext, ...breadcrumbNode } = breadcrumbJsonLd(breadcrumbItems);
  return {
    "@context": "https://schema.org",
    "@graph": [primaryNode, breadcrumbNode],
  };
}

function buildLocalizedBody({ locale, title, description, entity, hub, items = [], relatedLinks = [] }) {
  const copy = localizedCopy[locale];
  const label = hub ? copy.hub[hub][0] : title;
  const crumbs = `<nav aria-label="Breadcrumb"><a href="${escAttr(localizedPath("/", locale))}">${escHtml(copy.home)}</a> › ${escHtml(label)}</nav>`;
  const intro = entity?.intro || entity?.description || entity?.summary || description;
  const sections = entity?.sections?.map((section) =>
    `<section><h2>${escHtml(section.heading)}</h2><p>${escHtml(section.body)}</p></section>`
  ).join("") || "";
  const criteria = entity?.criteria?.map((criterion) =>
    `<section><h2>${escHtml(criterion.name)}</h2><p>${escHtml(criterion.mallA)}</p><p>${escHtml(criterion.mallB)}</p></section>`
  ).join("") || "";
  const routeStops = entity?.stops?.filter((stop) => isStandaloneMall(mallById[stop.mallId])).map((stop) => {
    const mall = mallById[stop.mallId];
    return `<li><a href="${escAttr(localizedPath(mallCanonicalPath(mall), locale))}">${escHtml(mall.name)}</a>${stop.note ? ` — ${escHtml(stop.note)}` : ""}</li>`;
  }).join("") || "";
  const bestFor = entity?.bestFor?.length ? `<section><h2>${escHtml(copy.bestFor)}</h2><ul>${entity.bestFor.map((item) => `<li>${escHtml(item)}</li>`).join("")}</ul></section>` : "";
  const notIdealFor = entity?.notIdealFor?.length ? `<section><h2>${escHtml(copy.notIdealFor)}</h2><ul>${entity.notIdealFor.map((item) => `<li>${escHtml(item)}</li>`).join("")}</ul></section>` : "";
  const tips = entity?.tips?.length ? `<section><h2>${escHtml(copy.tips)}</h2><ul>${entity.tips.map((tip) => `<li>${escHtml(tip)}</li>`).join("")}</ul></section>` : "";
  const transport = entity?.transport?.metro || entity?.recommendedTime ? `<section><h2>${escHtml(copy.transport)}</h2>${entity.transport?.metro ? `<p>${escHtml(entity.transport.metro)}</p>` : ""}${entity.recommendedTime ? `<p><strong>${escHtml(copy.duration)}:</strong> ${escHtml(entity.recommendedTime)}</p>` : ""}</section>` : "";
  const nearby = entity?.nearbyAttractions?.length ? `<section><h2>${escHtml(copy.nearby)}</h2><ul>${entity.nearbyAttractions.map((place) => `<li>${escHtml(place)}</li>`).join("")}</ul></section>` : "";
  const stores = entity?.stores?.length ? `<section><h2>${escHtml(copy.stores)}</h2><ul>${entity.stores.map((store) => `<li>${escHtml(store.name)}</li>`).join("")}</ul></section>` : "";
  const linkedMallIds = entity?.relatedMalls || entity?.mallIds || [];
  const relatedMalls = linkedMallIds.length ? `<section><h2>${escHtml(copy.relatedMalls)}</h2><ul>${linkedMallIds.map((mallId) => mallById[mallId]).filter(isStandaloneMall).map((mall) =>
    `<li><a href="${escAttr(localizedPath(mallCanonicalPath(mall), locale))}">${escHtml(mall.name)}</a></li>`
  ).join("")}</ul></section>` : "";
  const itemList = items.length ? `<section><ul>${items.map((item) =>
    `<li><a href="${escAttr(item.url)}">${escHtml(item.name)}</a>${item.description ? `<p>${escHtml(item.description)}</p>` : ""}</li>`
  ).join("")}</ul></section>` : "";
  const related = relatedLinks.map(({ label, items: relatedItems }) => relatedItems.length
    ? `<section><h2>${escHtml(label)}</h2><ul>${relatedItems.map((item) => `<li><a href="${escAttr(item.url)}">${escHtml(item.name)}</a></li>`).join("")}</ul></section>`
    : ""
  ).join("");
  const mapsUrl = entity?.stops ? routeMapsUrl(entity) : entity?.id && entity?.entityStatus !== "integrated" && entity?.lat != null ? mallMapsUrl(entity) : null;
  const actions = `${mapsUrl ? `<p><a href="${escAttr(mapsUrl)}" target="_blank" rel="noopener noreferrer">${escHtml(copy.map)}</a></p>` : ""}${entity?.officialUrl ? `<p><a href="${escAttr(entity.officialUrl)}" target="_blank" rel="noopener noreferrer">${escHtml(copy.official)}</a></p>` : ""}`;
  const publicNav = `<nav aria-label="Primary"><a href="${localizedPath("/malls/", locale)}">${escHtml(copy.malls)}</a> · <a href="${localizedPath("/outlets/", locale)}">${escHtml(copy.outlets)}</a> · <a href="${localizedPath("/rutas/", locale)}">${escHtml(copy.routes)}</a> · <a href="${localizedPath("/guias/", locale)}">${escHtml(copy.guides)}</a> · <a href="${localizedPath("/comparar/", locale)}">${escHtml(copy.comparisons)}</a></nav>`;
  return `<main id="root" data-prerendered="true" style="font-family:sans-serif;max-width:800px;margin:0 auto;padding:1rem 1.5rem">
    ${publicNav}${crumbs}<article><h1>${escHtml(title)}</h1>${description ? `<p>${escHtml(description)}</p>` : ""}${entity && intro && intro !== description ? `<p>${escHtml(intro)}</p>` : ""}${itemList}${sections}${criteria}${routeStops ? `<ol>${routeStops}</ol>` : ""}${bestFor}${notIdealFor}${transport}${nearby}${stores}${tips}${relatedMalls}${related}${entity?.conclusion ? `<p>${escHtml(entity.conclusion)}</p>` : ""}${actions}</article>
  </main>`;
}

function breadcrumbHtml(items) {
  const links = items
    .map((item, i) => {
      if (i < items.length - 1) {
        return `<a href="${escAttr(item.url)}" style="color:#2563eb">${escHtml(item.name)}</a>`;
      }
      return `<span aria-current="page">${escHtml(item.name)}</span>`;
    })
    .join(' <span aria-hidden="true">›</span> ');
  return `<nav aria-label="Breadcrumb" style="font-size:.875rem;color:#6b7280;margin-bottom:1rem">${links}</nav>`;
}

// ── transport helper ───────────────────────────────────────────────────────

function transportLines(transport) {
  const lines = [];
  if (transport?.metro) lines.push(`Metro: ${transport.metro}`);
  if (typeof transport?.uber === "boolean") lines.push(`Uber / taxi: ${transport.uber ? "Sí" : "No"}`);
  if (typeof transport?.parking === "boolean") lines.push(`Estacionamiento: ${transport.parking ? "Sí" : "No"}`);
  if (transport?.bus) lines.push(`Bus: ${transport.bus}`);
  return lines;
}

function priceLevelLabel(level) {
  if (!level) return null;
  if (level === "alto") return "Premium ($$$)";
  if (level === "medio-alto") return "Medio-alto ($$-$$$)";
  if (level === "medio") return "Medio ($$)";
  if (level === "bajo-medio") return "Económico ($-$$)";
  if (level === "economico") return "Económico ($)";
  return level;
}

// ── write helper ───────────────────────────────────────────────────────────

function writeHtml(relPath, html) {
  const fullPath = resolve(ROOT, relPath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, html, "utf-8");
}

// ══════════════════════════════════════════════════════════════════════════════
// MALL / OUTLET PAGES
// ══════════════════════════════════════════════════════════════════════════════

function buildShoppingCenterJsonLd(mall, pageUrl) {
  const obj = {
    "@context": "https://schema.org",
    "@type": "ShoppingCenter",
    "@id": `${pageUrl}#shoppingcenter`,
    name: mall.name,
    url: pageUrl,
    hasMap: mallMapsUrl(mall),
    isAccessibleForFree: true,
  };
  if (mall.description) obj.description = mall.description;
  if (mall.commune) obj.address = {
      "@type": "PostalAddress",
      addressLocality: mall.commune,
      addressRegion: "Región Metropolitana",
      addressCountry: "CL",
    };
  if (typeof mall.lat === "number" && typeof mall.lng === "number") {
    obj.geo = { "@type": "GeoCoordinates", latitude: mall.lat, longitude: mall.lng };
  }
  if (mall.imageUrl) obj.image = `${SITE_URL}${mall.imageUrl}`;
  if (mall.officialUrl) obj.sameAs = [mall.officialUrl];
  if (mall.priceLevel) {
    obj.priceRange = mall.priceLevel === "alto" || mall.priceLevel === "medio-alto" ? "$$$" : mall.priceLevel === "medio" ? "$$" : "$";
  }
  const storesWithNames = mall.stores?.filter((store) => store?.name) || [];
  if (storesWithNames.length) {
    obj.containsPlace = storesWithNames.slice(0, 20).map((s) => ({ "@type": "Store", name: s.name }));
  }
  return obj;
}

function buildIntegratedWebPageJsonLd(mall, pageUrl) {
  const parentUrl = `${SITE_URL}/malls/${mall.integratedInto}/`;
  const parent = {
    "@id": `${parentUrl}#shoppingcenter`,
    name: "Parque Arauco",
    url: parentUrl,
  };
  const obj = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    name: mall.name,
    url: pageUrl,
    about: parent,
    isPartOf: parent,
  };
  if (mall.description) obj.description = mall.description;
  if (mall.imageUrl) obj.image = `${SITE_URL}${mall.imageUrl}`;
  return obj;
}

function buildMallOrOutletBody(mall, pageType) {
  const canonPath = mallCanonicalPath(mall);
  const pageUrl = `${SITE_URL}${canonPath}`;
  const mapsUrl = mall.entityStatus === "integrated" ? null : mallMapsUrl(mall);
  const indexPath = pageType === "outlet" ? "/outlets/" : "/malls/";
  const indexName = pageType === "outlet" ? "Outlets en Santiago" : "Malls en Santiago";

  const bcItems = [
    { name: "Shopeando", url: `${SITE_URL}/` },
    { name: indexName, url: `${SITE_URL}${indexPath}` },
    { name: mall.name, url: pageUrl },
  ];

  let body = `<main id="root" data-prerendered="true" style="font-family:sans-serif;max-width:800px;margin:0 auto;padding:1rem 1.5rem">`;
  body += `\n  ${breadcrumbHtml(bcItems)}`;
  body += `\n  <header style="margin-top:.5rem">`;
  if (mall.imageUrl) {
    body += `\n    <img src="${escAttr(SITE_URL + mall.imageUrl)}" alt="${escAttr(mall.name)}" width="800" height="400" style="width:100%;height:auto;border-radius:8px;object-fit:cover" loading="lazy" />`;
  }
  body += `\n    <h1 style="margin:.75rem 0 .25rem">${escHtml(mall.name)}</h1>`;
  if (mall.commune || mapsUrl) body += `\n    <p style="margin:0;color:#555">${mall.commune ? `${escHtml(mall.commune)}, Santiago de Chile` : ""}${mall.commune && mapsUrl ? " &nbsp;·&nbsp; " : ""}${mapsUrl ? `<a href="${escAttr(mapsUrl)}" target="_blank" rel="noopener noreferrer" style="color:#2563eb">Ver en Google Maps</a>` : ""}</p>`;
  body += `\n  </header>`;

  if (mall.description) {
    body += `\n  <section aria-label="Descripción" style="margin-top:1rem">`;
    body += `\n    <p style="font-size:1.05rem;line-height:1.6">${escHtml(mall.description)}</p>`;
    body += `\n  </section>`;
  }

  // Key facts
  const facts = [];
  if (mall.recommendedTime) facts.push(`<strong>Tiempo sugerido por Shopeando:</strong> ${escHtml(mall.recommendedTime)}`);
  const priceLabel = priceLevelLabel(mall.priceLevel);
  if (priceLabel) facts.push(`<strong>Nivel de precios:</strong> ${escHtml(priceLabel)}`);
  if (mall.touristScore != null) facts.push(`<strong>Puntuación turística:</strong> ${mall.touristScore}/10`);
  if (mall.familyFriendly) facts.push(`<strong>Apto para familias:</strong> Sí`);
  if (mall.outlet) facts.push(`<strong>Outlet:</strong> Sí`);
  if (mall.premium) facts.push(`<strong>Premium:</strong> Sí`);

  if (facts.length) {
    body += `\n  <section aria-label="Información clave" style="margin-top:1.25rem">`;
    body += `\n    <h2 style="font-size:1.1rem;margin-bottom:.5rem">Información</h2>`;
    body += `\n    <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.35rem">`;
    for (const f of facts) body += `\n      <li>${f}</li>`;
    body += `\n    </ul>\n  </section>`;
  }

  // Transport
  const transportItems = transportLines(mall.transport);
  if (transportItems.length) {
    body += `\n  <section aria-label="Cómo llegar" style="margin-top:1.25rem">`;
    body += `\n    <h2 style="font-size:1.1rem;margin-bottom:.5rem">Cómo llegar</h2>`;
    body += `\n    <ul style="list-style:disc;padding-left:1.25rem;margin:0;display:flex;flex-direction:column;gap:.25rem">`;
    for (const t of transportItems) body += `\n      <li>${escHtml(t)}</li>`;
    body += `\n    </ul>\n  </section>`;
  }

  // Best for
  if (mall.bestFor?.length) {
    body += `\n  <section aria-label="Ideal para" style="margin-top:1.25rem">`;
    body += `\n    <h2 style="font-size:1.1rem;margin-bottom:.5rem">Ideal para</h2>`;
    body += `\n    <ul style="list-style:disc;padding-left:1.25rem;margin:0;display:flex;flex-direction:column;gap:.25rem">`;
    for (const b of mall.bestFor) body += `\n      <li>${escHtml(b)}</li>`;
    body += `\n    </ul>\n  </section>`;
  }

  // Stores
  if (mall.stores?.length) {
    body += `\n  <section aria-label="Tiendas" style="margin-top:1.25rem">`;
    body += `\n    <h2 style="font-size:1.1rem;margin-bottom:.5rem">Tiendas destacadas</h2>`;
    body += `\n    <ul style="list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:.4rem">`;
    for (const store of mall.stores) {
      body += `\n      <li style="background:#f1f5f9;padding:.2rem .6rem;border-radius:4px;font-size:.9rem">${escHtml(store.name)}</li>`;
    }
    body += `\n    </ul>\n  </section>`;
  }

  // Nearby attractions
  if (mall.nearbyAttractions?.length) {
    body += `\n  <section aria-label="Atracciones cercanas" style="margin-top:1.25rem">`;
    body += `\n    <h2 style="font-size:1.1rem;margin-bottom:.5rem">Atracciones cercanas</h2>`;
    body += `\n    <ul style="list-style:disc;padding-left:1.25rem;margin:0;display:flex;flex-direction:column;gap:.25rem">`;
    for (const a of mall.nearbyAttractions) body += `\n      <li>${escHtml(a)}</li>`;
    body += `\n    </ul>\n  </section>`;
  }

  // Tips
  if (mall.tips?.length) {
    body += `\n  <section aria-label="Consejos" style="margin-top:1.25rem">`;
    body += `\n    <h2 style="font-size:1.1rem;margin-bottom:.5rem">Consejos</h2>`;
    body += `\n    <ul style="list-style:disc;padding-left:1.25rem;margin:0;display:flex;flex-direction:column;gap:.25rem">`;
    for (const t of mall.tips) body += `\n      <li>${escHtml(t)}</li>`;
    body += `\n    </ul>\n  </section>`;
  }

  if (mall.officialUrl) {
    body += `\n  <p style="margin-top:1.25rem"><a href="${escAttr(mall.officialUrl)}" target="_blank" rel="noopener noreferrer" style="color:#2563eb">Sitio oficial de ${escHtml(mall.name)} →</a></p>`;
  }

  body += `\n</main>`;
  return body;
}

// ══════════════════════════════════════════════════════════════════════════════
// INDEX PAGES
// ══════════════════════════════════════════════════════════════════════════════

function buildItemListJsonLd(name, description, pageUrl, items) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${pageUrl}#itemlist`,
    name,
    description,
    url: pageUrl,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

function buildIndexBody(opts) {
  const { title, description, items, pageUrl, breadcrumbs } = opts;
  let body = `<main id="root" data-prerendered="true" style="font-family:sans-serif;max-width:800px;margin:0 auto;padding:1rem 1.5rem">`;
  body += `\n  ${breadcrumbHtml(breadcrumbs)}`;
  body += `\n  <header style="margin-top:.5rem">`;
  body += `\n    <h1 style="margin:0 0 .5rem">${escHtml(title)}</h1>`;
  body += `\n    <p style="color:#555;margin:0">${escHtml(description)}</p>`;
  body += `\n  </header>`;
  body += `\n  <section aria-label="${escAttr(title)}" style="margin-top:1.5rem">`;
  body += `\n    <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.75rem">`;
  for (const item of items) {
    body += `\n      <li>`;
    body += `\n        <a href="${escAttr(item.url)}" style="color:#2563eb;font-size:1rem;font-weight:500">${escHtml(item.name)}</a>`;
    if (item.description) {
      body += `\n        <p style="margin:.2rem 0 0;color:#555;font-size:.9rem">${escHtml(item.description)}</p>`;
    }
    body += `\n      </li>`;
  }
  body += `\n    </ul>`;
  body += `\n  </section>`;
  body += `\n</main>`;
  return body;
}

// ══════════════════════════════════════════════════════════════════════════════
// ROUTE PAGES
// ══════════════════════════════════════════════════════════════════════════════

function buildRouteJsonLd(route, pageUrl) {
  const stopItems = (route.stops || []).filter((stop) => isStandaloneMall(mallById[stop.mallId])).map((stop, i) => {
    const mall = mallById[stop.mallId];
    return {
      "@type": "ListItem",
      position: i + 1,
      name: mall.name,
      url: `${SITE_URL}${mallCanonicalPath(mall)}`,
    };
  });

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        name: route.title,
        url: pageUrl,
        inLanguage: "es-CL",
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#itemlist`,
        name: `Paradas: ${route.title}`,
        url: pageUrl,
        numberOfItems: stopItems.length,
        itemListElement: stopItems,
      },
      breadcrumbJsonLd([
        { name: "Shopeando", url: `${SITE_URL}/` },
        { name: "Rutas de compras", url: `${SITE_URL}/rutas/` },
        { name: route.title, url: pageUrl },
      ]),
    ],
  };
  if (route.summary) schema["@graph"][0].description = route.summary;
  return schema;
}

function buildRouteBody(route) {
  const pageUrl = `${SITE_URL}/rutas/${route.id}/`;
  const mapsUrl = routeMapsUrl(route);
  const bcItems = [
    { name: "Shopeando", url: `${SITE_URL}/` },
    { name: "Rutas de compras", url: `${SITE_URL}/rutas/` },
    { name: route.title, url: pageUrl },
  ];

  let body = `<main id="root" data-prerendered="true" style="font-family:sans-serif;max-width:800px;margin:0 auto;padding:1rem 1.5rem">`;
  body += `\n  ${breadcrumbHtml(bcItems)}`;
  body += `\n  <header style="margin-top:.5rem">`;
  body += `\n    <h1 style="margin:0 0 .5rem">${escHtml(route.title)}</h1>`;
  if (route.summary) body += `\n    <p style="color:#555;margin:0">${escHtml(route.summary)}</p>`;
  body += `\n  </header>`;

  if (route.duration || route.bestFor?.length) {
    body += `\n  <section aria-label="Información" style="margin-top:1.25rem">`;
    body += `\n    <h2 style="font-size:1.1rem;margin-bottom:.5rem">Información</h2>`;
    body += `\n    <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.35rem">`;
    if (route.duration) body += `\n      <li><strong>Duración:</strong> ${escHtml(route.duration)}</li>`;
    if (route.bestFor?.length) body += `\n      <li><strong>Ideal para:</strong> ${escHtml(route.bestFor.join(", "))}</li>`;
    body += `\n    </ul>\n  </section>`;
  }

  const validStops = (route.stops || []).filter((stop) => isStandaloneMall(mallById[stop.mallId]));
  if (validStops.length) {
    body += `\n  <section aria-label="Paradas" style="margin-top:1.25rem">`;
    body += `\n    <h2 style="font-size:1.1rem;margin-bottom:.75rem">Paradas de la ruta</h2>`;
    body += `\n    <ol style="padding-left:1.25rem;margin:0;display:flex;flex-direction:column;gap:1rem">`;
    for (const stop of validStops) {
      const mall = mallById[stop.mallId];
      if (isStandaloneMall(mall)) {
        const mallPath = mallCanonicalPath(mall);
        body += `\n      <li>`;
        body += `\n        <a href="${escAttr(SITE_URL + mallPath)}" style="color:#2563eb;font-weight:500">${escHtml(mall.name)}</a>`;
        if (mall.commune) body += ` <span style="color:#6b7280;font-size:.875rem">(${escHtml(mall.commune)})</span>`;
        if (stop.note) body += `\n        <p style="margin:.3rem 0 0;color:#555;font-size:.9rem">${escHtml(stop.note)}</p>`;
        body += `\n      </li>`;
      }
    }
    body += `\n    </ol>\n  </section>`;
  }

  if (route.tips?.length) {
    body += `\n  <section aria-label="Consejos" style="margin-top:1.25rem">`;
    body += `\n    <h2 style="font-size:1.1rem;margin-bottom:.5rem">Consejos</h2>`;
    body += `\n    <ul style="list-style:disc;padding-left:1.25rem;margin:0;display:flex;flex-direction:column;gap:.25rem">`;
    for (const t of route.tips) body += `\n      <li>${escHtml(t)}</li>`;
    body += `\n    </ul>\n  </section>`;
  }

  if (mapsUrl) {
    body += `\n  <p style="margin-top:1.25rem"><a href="${escAttr(mapsUrl)}" target="_blank" rel="noopener noreferrer" style="color:#2563eb">Abrir ruta en Google Maps →</a></p>`;
  }

  body += `\n</main>`;
  return body;
}

// ══════════════════════════════════════════════════════════════════════════════
// GUIDE PAGES
// ══════════════════════════════════════════════════════════════════════════════

function buildGuideJsonLd(guide, pageUrl) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline: guide.title,
        description: guide.description,
        url: pageUrl,
        image: guide.imageUrl ? `${SITE_URL}${guide.imageUrl}` : `${SITE_URL}/images/og-image.png`,
        datePublished: guide.publishedAt,
        dateModified: guide.modifiedAt,
        inLanguage: "es-CL",
        publisher: {
          "@type": "Organization",
          name: "Shopeando",
          url: SITE_URL,
        },
        author: {
          "@type": "Organization",
          name: "Shopeando",
          url: SITE_URL,
        },
      },
      breadcrumbJsonLd([
        { name: "Shopeando", url: `${SITE_URL}/` },
        { name: "Guías de compras", url: `${SITE_URL}/guias/` },
        { name: guide.title, url: pageUrl },
      ]),
    ],
  };
  return schema;
}

function buildGuideBody(guide) {
  const pageUrl = `${SITE_URL}/guias/${guide.id}/`;
  const bcItems = [
    { name: "Shopeando", url: `${SITE_URL}/` },
    { name: "Guías de compras", url: `${SITE_URL}/guias/` },
    { name: guide.title, url: pageUrl },
  ];

  let body = `<main id="root" data-prerendered="true" style="font-family:sans-serif;max-width:800px;margin:0 auto;padding:1rem 1.5rem">`;
  body += `\n  ${breadcrumbHtml(bcItems)}`;

  if (guide.imageUrl) {
    body += `\n  <img src="${escAttr(SITE_URL + guide.imageUrl)}" alt="${escAttr(guide.title)}" width="800" height="400" style="width:100%;height:auto;border-radius:8px;object-fit:cover;margin-bottom:1rem" loading="lazy" />`;
  }

  body += `\n  <article>`;
  body += `\n    <header>`;
  body += `\n      <h1 style="margin:0 0 .5rem">${escHtml(guide.title)}</h1>`;
  body += `\n      <p style="color:#555;margin:0;font-size:1rem">${escHtml(guide.description)}</p>`;
  if (guide.publishedAt) {
    body += `\n      <p style="color:#6b7280;font-size:.875rem;margin:.5rem 0 0">Publicado: <time datetime="${escAttr(guide.publishedAt)}">${escHtml(guide.publishedAt)}</time>`;
    if (guide.modifiedAt && guide.modifiedAt !== guide.publishedAt) {
      body += ` · Actualizado: <time datetime="${escAttr(guide.modifiedAt)}">${escHtml(guide.modifiedAt)}</time>`;
    }
    body += `</p>`;
  }
  body += `\n    </header>`;

  for (const section of guide.sections || []) {
    body += `\n    <section style="margin-top:1.5rem">`;
    body += `\n      <h2 style="font-size:1.15rem;margin-bottom:.6rem">${escHtml(section.heading)}</h2>`;
    body += `\n      <p style="line-height:1.7;color:#333">${escHtml(section.body)}</p>`;
    body += `\n    </section>`;
  }

  if (guide.relatedMalls?.length) {
    body += `\n    <aside aria-label="Malls relacionados" style="margin-top:1.5rem;padding:1rem;background:#f8fafc;border-radius:8px">`;
    body += `\n      <h3 style="font-size:1rem;margin:0 0 .6rem">Malls relacionados</h3>`;
    body += `\n      <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.4rem">`;
    for (const mallId of guide.relatedMalls) {
      const mall = mallById[mallId];
      if (isStandaloneMall(mall)) {
        const mallPath = mallCanonicalPath(mall);
        body += `\n        <li><a href="${escAttr(SITE_URL + mallPath)}" style="color:#2563eb">${escHtml(mall.name)}</a> <span style="color:#6b7280;font-size:.875rem">— ${escHtml(mall.commune)}</span></li>`;
      }
    }
    body += `\n      </ul>\n    </aside>`;
  }

  body += `\n  </article>`;
  body += `\n</main>`;
  return body;
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPARISON PAGES
// ══════════════════════════════════════════════════════════════════════════════

function buildComparisonJsonLd(comparison, pageUrl) {
  const mallItems = (comparison.mallIds || [])
    .map((id) => mallById[id])
    .filter(isStandaloneMall)
    .map((mall, i) => {
    return {
      "@type": "ListItem",
      position: i + 1,
      name: mall.name,
      url: `${SITE_URL}${mallCanonicalPath(mall)}`,
    };
  });

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        name: comparison.title,
        description: comparison.description,
        url: pageUrl,
        inLanguage: "es-CL",
        datePublished: comparison.publishedAt,
        dateModified: comparison.modifiedAt,
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#itemlist`,
        name: comparison.title,
        url: pageUrl,
        numberOfItems: mallItems.length,
        itemListElement: mallItems,
      },
      breadcrumbJsonLd([
        { name: "Shopeando", url: `${SITE_URL}/` },
        { name: "Comparaciones", url: `${SITE_URL}/comparar/` },
        { name: comparison.title, url: pageUrl },
      ]),
    ],
  };
  return schema;
}

function buildComparisonBody(comparison) {
  const pageUrl = `${SITE_URL}/comparar/${comparison.id}/`;
  const bcItems = [
    { name: "Shopeando", url: `${SITE_URL}/` },
    { name: "Comparaciones", url: `${SITE_URL}/comparar/` },
    { name: comparison.title, url: pageUrl },
  ];

  const [mallA, mallB] = (comparison.mallIds || []).map((id) => mallById[id]).filter(isStandaloneMall);

  let body = `<main id="root" data-prerendered="true" style="font-family:sans-serif;max-width:800px;margin:0 auto;padding:1rem 1.5rem">`;
  body += `\n  ${breadcrumbHtml(bcItems)}`;

  if (comparison.imageUrl) {
    body += `\n  <img src="${escAttr(SITE_URL + comparison.imageUrl)}" alt="${escAttr(comparison.title)}" width="800" height="400" style="width:100%;height:auto;border-radius:8px;object-fit:cover;margin-bottom:1rem" loading="lazy" />`;
  }

  body += `\n  <article>`;
  body += `\n    <header>`;
  body += `\n      <h1 style="margin:0 0 .5rem">${escHtml(comparison.title)}</h1>`;
  body += `\n      <p style="color:#555;margin:0;font-size:1rem">${escHtml(comparison.description)}</p>`;
  body += `\n    </header>`;

  if (comparison.intro) {
    body += `\n    <p style="margin-top:1rem;line-height:1.7">${escHtml(comparison.intro)}</p>`;
  }

  if (mallA && mallB) {
    body += `\n    <div style="display:flex;gap:1rem;margin:1.25rem 0;flex-wrap:wrap">`;
    for (const mall of [mallA, mallB]) {
      const mallPath = mallCanonicalPath(mall);
      body += `\n      <a href="${escAttr(SITE_URL + mallPath)}" style="flex:1;min-width:200px;padding:.75rem 1rem;background:#f1f5f9;border-radius:8px;text-decoration:none;color:#1e40af;font-weight:500">${escHtml(mall.name)} <span style="font-weight:400;color:#555">— ${escHtml(mall.commune)}</span></a>`;
    }
    body += `\n    </div>`;
  }

  for (const crit of comparison.criteria || []) {
    body += `\n    <section style="margin-top:1.5rem;border-top:1px solid #e5e7eb;padding-top:1.25rem">`;
    body += `\n      <h2 style="font-size:1.1rem;margin:0 0 .75rem">${escHtml(crit.name)}</h2>`;
    body += `\n      <div style="display:flex;gap:1rem;flex-wrap:wrap">`;
    if (mallA) {
      body += `\n        <div style="flex:1;min-width:200px">`;
      body += `\n          <h3 style="font-size:.95rem;margin:0 0 .4rem;color:#1e40af">${escHtml(mallA.name)}</h3>`;
      body += `\n          <p style="margin:0;font-size:.9rem;color:#333;line-height:1.6">${escHtml(crit.mallA)}</p>`;
      body += `\n        </div>`;
    }
    if (mallB) {
      body += `\n        <div style="flex:1;min-width:200px">`;
      body += `\n          <h3 style="font-size:.95rem;margin:0 0 .4rem;color:#1e40af">${escHtml(mallB.name)}</h3>`;
      body += `\n          <p style="margin:0;font-size:.9rem;color:#333;line-height:1.6">${escHtml(crit.mallB)}</p>`;
      body += `\n        </div>`;
    }
    body += `\n      </div>\n    </section>`;
  }

  if (comparison.conclusion) {
    body += `\n    <section style="margin-top:1.5rem;padding:1rem;background:#f0fdf4;border-radius:8px;border-left:4px solid #16a34a">`;
    body += `\n      <h2 style="font-size:1rem;margin:0 0 .5rem;color:#15803d">Conclusión</h2>`;
    body += `\n      <p style="margin:0;line-height:1.7;color:#333">${escHtml(comparison.conclusion)}</p>`;
    body += `\n    </section>`;
  }

  body += `\n  </article>`;
  body += `\n</main>`;
  return body;
}

// ══════════════════════════════════════════════════════════════════════════════
// LEGACY NOINDEX REDIRECTS
// ══════════════════════════════════════════════════════════════════════════════

function buildLegacyRedirectPage(mall) {
  const canonPath = mallCanonicalPath(mall);
  const canonicalFullUrl = `${SITE_URL}${canonPath}`;
  const title = `${mall.name} — Redirigiendo... | Shopeando`;
  const description = mall.description || "";

  let html = template;
  html = replaceTitle(html, title);
  html = setMetaContent(html, 'name="description"', description);
  html = setMetaContent(html, 'rel="canonical"', canonicalFullUrl);
  html = setMetaContent(html, 'property="og:url"', canonicalFullUrl);
  html = setMetaContent(html, 'property="og:title"', title);
  html = setMetaContent(html, 'property="og:description"', description);
  html = injectNoIndex(html);
  html = addMetaRefresh(html, canonicalFullUrl);

  const body = `<main id="root" data-prerendered="true" style="font-family:sans-serif;max-width:800px;margin:2rem auto;padding:1rem 1.5rem;text-align:center">
  <p>Esta página ha cambiado de URL.</p>
  <p><a href="${escAttr(canonicalFullUrl)}" style="color:#2563eb">Ver ${escHtml(mall.name)} →</a></p>
</main>`;

  html = replaceBody(html, body);
  return html;
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════

const today = new Date().toISOString().slice(0, 10);
const defaultOgImage = `${SITE_URL}/images/og-image.png`;
let count = 0;

// ── 1. Individual mall pages (/malls/:id)
for (const mall of mallPages) {
  const canonPath = `/malls/${mall.id}/`;
  const pageUrl = `${SITE_URL}${canonPath}`;
  const title = `${mall.name} · Información y cómo llegar | Shopeando`;
  const description = mall.description || "";
  const ogImage = mall.imageUrl ? `${SITE_URL}${mall.imageUrl}` : defaultOgImage;
  const primaryJsonLd = mall.entityStatus === "integrated"
    ? buildIntegratedWebPageJsonLd(mall, pageUrl)
    : buildShoppingCenterJsonLd(mall, pageUrl);
  const jsonLd = pageGraphJsonLd(primaryJsonLd, [
    { name: "Shopeando", url: `${SITE_URL}/` },
    { name: "Malls en Santiago", url: `${SITE_URL}/malls/` },
    { name: mall.name, url: pageUrl },
  ]);

  let html = buildHead({ html: template, title, description, canonical: pageUrl, ogImage, jsonLd });
  html = replaceBody(html, buildMallOrOutletBody(mall, "mall"));
  writeHtml(`dist/malls/${mall.id}/index.html`, html);
  count++;
}

// ── 2. Individual outlet pages (/outlets/:id)
for (const mall of outletPages) {
  const canonPath = `/outlets/${mall.id}/`;
  const pageUrl = `${SITE_URL}${canonPath}`;
  const title = `${mall.name} · Outlet en Santiago | Shopeando`;
  const description = mall.description || "";
  const ogImage = mall.imageUrl ? `${SITE_URL}${mall.imageUrl}` : defaultOgImage;
  const jsonLd = pageGraphJsonLd(buildShoppingCenterJsonLd(mall, pageUrl), [
    { name: "Shopeando", url: `${SITE_URL}/` },
    { name: "Outlets en Santiago", url: `${SITE_URL}/outlets/` },
    { name: mall.name, url: pageUrl },
  ]);

  let html = buildHead({ html: template, title, description, canonical: pageUrl, ogImage, jsonLd });
  html = replaceBody(html, buildMallOrOutletBody(mall, "outlet"));
  writeHtml(`dist/outlets/${mall.id}/index.html`, html);
  count++;
}

// ── 3. /malls/ index
{
  const pageUrl = `${SITE_URL}/malls/`;
  const title = "Malls en Santiago de Chile · Guía completa | Shopeando";
  const description = "Directorio de los mejores centros comerciales de Santiago de Chile. Encuentra el mall ideal según tu zona, presupuesto y tiempo disponible.";
  const items = standaloneMallPages.map((m) => ({
    name: m.name,
    url: `${SITE_URL}/malls/${m.id}/`,
    description: m.description,
  }));
  const bcItems = [
    { name: "Shopeando", url: `${SITE_URL}/` },
    { name: "Malls en Santiago", url: pageUrl },
  ];
  const jsonLd = pageGraphJsonLd(
    buildItemListJsonLd(title, description, pageUrl, items.map(i => ({ name: i.name, url: i.url }))),
    bcItems,
  );
  const body = buildIndexBody({ title, description, items, pageUrl, breadcrumbs: bcItems });
  let html = buildHead({ html: template, title, description, canonical: pageUrl, ogImage: defaultOgImage, jsonLd });
  html = replaceBody(html, body);
  writeHtml("dist/malls/index.html", html);
  count++;
}

// ── 4. /outlets/ index
{
  const pageUrl = `${SITE_URL}/outlets/`;
  const title = "Outlets en Santiago de Chile · Guía de descuentos | Shopeando";
  const description = "Los mejores outlets de Santiago de Chile: Easton Outlet Mall y Arauco Premium Outlet Buenaventura. Descuentos en moda, deporte y marcas internacionales.";
  const items = standaloneOutletPages.map((m) => ({
    name: m.name,
    url: `${SITE_URL}/outlets/${m.id}/`,
    description: m.description,
  }));
  const bcItems = [
    { name: "Shopeando", url: `${SITE_URL}/` },
    { name: "Outlets en Santiago", url: pageUrl },
  ];
  const jsonLd = pageGraphJsonLd(
    buildItemListJsonLd(title, description, pageUrl, items.map(i => ({ name: i.name, url: i.url }))),
    bcItems,
  );
  const body = buildIndexBody({ title, description, items, pageUrl, breadcrumbs: bcItems });
  let html = buildHead({ html: template, title, description, canonical: pageUrl, ogImage: defaultOgImage, jsonLd });
  html = replaceBody(html, body);
  writeHtml("dist/outlets/index.html", html);
  count++;
}

// ── 5. Individual route pages (/rutas/:id)
for (const route of routes) {
  const canonPath = `/rutas/${route.id}/`;
  const pageUrl = `${SITE_URL}${canonPath}`;
  const title = `${route.title} · Ruta de compras en Santiago | Shopeando`;
  const description = route.summary || "";
  const jsonLd = buildRouteJsonLd(route, pageUrl);

  let html = buildHead({ html: template, title, description, canonical: pageUrl, ogImage: defaultOgImage, jsonLd });
  html = replaceBody(html, buildRouteBody(route));
  writeHtml(`dist/rutas/${route.id}/index.html`, html);
  count++;
}

// ── 6. /rutas/ index
{
  const pageUrl = `${SITE_URL}/rutas/`;
  const title = "Rutas de compras en Santiago · Circuitos curados | Shopeando";
  const description = "Rutas de compras curadas para visitar Santiago de Chile: primera vez, compras premium, outlet day, familia y más.";
  const items = routes.map((r) => ({
    name: r.title,
    url: `${SITE_URL}/rutas/${r.id}/`,
    description: r.summary,
  }));
  const bcItems = [
    { name: "Shopeando", url: `${SITE_URL}/` },
    { name: "Rutas de compras", url: pageUrl },
  ];
  const jsonLd = pageGraphJsonLd(
    buildItemListJsonLd(title, description, pageUrl, items.map(i => ({ name: i.name, url: i.url }))),
    bcItems,
  );
  const body = buildIndexBody({ title, description, items, pageUrl, breadcrumbs: bcItems });
  let html = buildHead({ html: template, title, description, canonical: pageUrl, ogImage: defaultOgImage, jsonLd });
  html = replaceBody(html, body);
  writeHtml("dist/rutas/index.html", html);
  count++;
}

// ── 7. Individual guide pages (/guias/:id)
for (const guide of guides) {
  const canonPath = `/guias/${guide.id}/`;
  const pageUrl = `${SITE_URL}${canonPath}`;
  const title = `${guide.title} | Shopeando`;
  const description = guide.description || "";
  const ogImage = guide.imageUrl ? `${SITE_URL}${guide.imageUrl}` : defaultOgImage;
  const jsonLd = buildGuideJsonLd(guide, pageUrl);

  let html = buildHead({ html: template, title, description, canonical: pageUrl, ogImage, jsonLd });
  html = replaceBody(html, buildGuideBody(guide));
  writeHtml(`dist/guias/${guide.id}/index.html`, html);
  count++;
}

// ── 8. /guias/ index
{
  const pageUrl = `${SITE_URL}/guias/`;
  const title = "Guías de compras en Santiago · Artículos editoriales | Shopeando";
  const description = "Guías editoriales sobre dónde comprar en Santiago de Chile: outlets, malls, compras para turistas y galerías del centro.";
  const items = guides.map((g) => ({
    name: g.title,
    url: `${SITE_URL}/guias/${g.id}/`,
    description: g.description,
  }));
  const bcItems = [
    { name: "Shopeando", url: `${SITE_URL}/` },
    { name: "Guías de compras", url: pageUrl },
  ];
  const jsonLd = pageGraphJsonLd(
    buildItemListJsonLd(title, description, pageUrl, items.map(i => ({ name: i.name, url: i.url }))),
    bcItems,
  );
  const body = buildIndexBody({ title, description, items, pageUrl, breadcrumbs: bcItems });
  let html = buildHead({ html: template, title, description, canonical: pageUrl, ogImage: defaultOgImage, jsonLd });
  html = replaceBody(html, body);
  writeHtml("dist/guias/index.html", html);
  count++;
}

// ── 9. Individual comparison pages (/comparar/:id)
for (const comparison of comparisons) {
  const canonPath = `/comparar/${comparison.id}/`;
  const pageUrl = `${SITE_URL}${canonPath}`;
  const title = `${comparison.title} | Shopeando`;
  const description = comparison.description || "";
  const ogImage = comparison.imageUrl ? `${SITE_URL}${comparison.imageUrl}` : defaultOgImage;
  const jsonLd = buildComparisonJsonLd(comparison, pageUrl);

  let html = buildHead({ html: template, title, description, canonical: pageUrl, ogImage, jsonLd });
  html = replaceBody(html, buildComparisonBody(comparison));
  writeHtml(`dist/comparar/${comparison.id}/index.html`, html);
  count++;
}

// ── 10. /comparar/ index
{
  const pageUrl = `${SITE_URL}/comparar/`;
  const title = "Comparaciones de malls en Santiago | Shopeando";
  const description = "Comparaciones curadas entre los principales malls de Santiago de Chile. Descubre cuál se adapta mejor a lo que buscas.";
  const items = comparisons.map((c) => ({
    name: c.title,
    url: `${SITE_URL}/comparar/${c.id}/`,
    description: c.description,
  }));
  const bcItems = [
    { name: "Shopeando", url: `${SITE_URL}/` },
    { name: "Comparaciones", url: pageUrl },
  ];
  const jsonLd = pageGraphJsonLd(
    buildItemListJsonLd(title, description, pageUrl, items.map(i => ({ name: i.name, url: i.url }))),
    bcItems,
  );
  const body = buildIndexBody({ title, description, items, pageUrl, breadcrumbs: bcItems });
  let html = buildHead({ html: template, title, description, canonical: pageUrl, ogImage: defaultOgImage, jsonLd });
  html = replaceBody(html, body);
  writeHtml("dist/comparar/index.html", html);
  count++;
}

// ── 11. Legacy /mall/:id noindex redirects (all 27 malls)
for (const mall of malls) {
  const html = buildLegacyRedirectPage(mall);
  writeHtml(`dist/mall/${mall.id}/index.html`, html);
  count++;
}

// ── 12. Portuguese and English public equivalents ───────────────────────────
const localizedPages = [
  ...mallPages.map((mall) => ({ entity: mall, path: `/malls/${mall.id}/`, kind: "mall" })),
  ...outletPages.map((mall) => ({ entity: mall, path: `/outlets/${mall.id}/`, kind: "mall" })),
  ...routes.map((route) => ({ entity: route, path: `/rutas/${route.id}/` })),
  ...guides.map((guide) => ({ entity: guide, path: `/guias/${guide.id}/` })),
  ...comparisons.map((comparison) => ({ entity: comparison, path: `/comparar/${comparison.id}/` })),
];
const localizedHubs = ["malls", "outlets", "rutas", "guias", "comparar"];

// English home page. The Portuguese home page is a dedicated editorial file
// copied from public/pt-br/index.html by Vite.
{
  const locale = "en";
  const pageUrl = `${SITE_URL}/en/`;
  const title = "Shopping in Santiago, Chile: mall and outlet guide";
  const description = "A free English-language guide to malls, outlets and shopping routes in Santiago, Chile, with practical advice for international visitors.";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: pageUrl,
    inLanguage: "en",
  };
  let html = buildHead({ html: template, title: `${title} | Shopeando`, description, canonical: pageUrl, ogImage: defaultOgImage, jsonLd });
  const items = [
    { name: localizedCopy.en.hub.malls[0], url: `${SITE_URL}/en/malls/`, description: localizedCopy.en.hub.malls[1] },
    { name: localizedCopy.en.hub.rutas[0], url: `${SITE_URL}/en/rutas/`, description: localizedCopy.en.hub.rutas[1] },
    { name: localizedCopy.en.hub.guias[0], url: `${SITE_URL}/en/guias/`, description: localizedCopy.en.hub.guias[1] },
  ];
  html = replaceBody(html, buildLocalizedBody({ locale, title, description, items }));
  writeHtml("dist/en/index.html", html);
  count++;
}

for (const locale of ["pt", "en"]) {
  for (const hub of localizedHubs) {
    const path = `/${hub}/`;
    const [title, description] = localizedCopy[locale].hub[hub];
    const pageUrl = `${SITE_URL}${localizedPath(path, locale)}`;
    const hubSourceItems = hub === "malls" ? standaloneMallPages
      : hub === "outlets" ? standaloneOutletPages
        : hub === "rutas" ? routes
          : hub === "guias" ? guides : comparisons;
    const hubItems = hubSourceItems.map((item) => {
      const localizedItem = hub === "malls" || hub === "outlets" ? localizeMall(item, locale)
        : hub === "rutas" ? localizeRoute(item, locale)
          : hub === "guias" ? localizeGuide(item, locale)
            : localizeComparison(item, locale);
      const itemPath = hub === "malls" ? `/malls/${item.id}/`
        : hub === "outlets" ? `/outlets/${item.id}/`
          : hub === "rutas" ? `/rutas/${item.id}/`
            : hub === "guias" ? `/guias/${item.id}/` : `/comparar/${item.id}/`;
      return {
        name: localizedItem.title || localizedItem.name,
        description: localizedItem.description || localizedItem.summary,
        url: `${SITE_URL}${localizedPath(itemPath, locale)}`,
      };
    });
    const jsonLd = pageGraphJsonLd(
      { "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: pageUrl, inLanguage: PUBLIC_LOCALES[locale].hreflang },
      [{ name: "Shopeando", url: `${SITE_URL}${localizedPath("/", locale)}` }, { name: title, url: pageUrl }],
    );
    let html = buildHead({ html: template, title: `${title} | Shopeando`, description, canonical: pageUrl, ogImage: defaultOgImage, jsonLd });
    html = replaceBody(html, buildLocalizedBody({ locale, title, description, hub, items: hubItems }));
    writeHtml(`dist${localizedPath(path, locale)}index.html`, html);
    count++;
  }
  for (const { entity: sourceEntity, path, kind } of localizedPages) {
    const entity = path.startsWith("/malls/") || path.startsWith("/outlets/") ? localizeMall(sourceEntity, locale)
      : path.startsWith("/rutas/") ? localizeRoute(sourceEntity, locale)
        : path.startsWith("/guias/") ? localizeGuide(sourceEntity, locale)
          : localizeComparison(sourceEntity, locale);
    const title = entity.title || entity.name;
    const description = entity.description || entity.summary || "";
    const pageUrl = `${SITE_URL}${localizedPath(path, locale)}`;
    const typeKey = path.startsWith("/outlets/") ? "outlet"
      : path.startsWith("/malls/") ? "mall"
        : path.startsWith("/rutas/") ? "route"
          : path.startsWith("/guias/") ? "guide" : "comparison";
    const seoTitle = `${title} · ${localizedCopy[locale].seoSuffix[typeKey]}`;
    const localizedPrimaryNode = sourceEntity.entityStatus === "integrated" ? {
      ...buildIntegratedWebPageJsonLd(entity, pageUrl),
      inLanguage: PUBLIC_LOCALES[locale].hreflang,
    } : {
      "@context": "https://schema.org",
      "@type": entity.sections ? "Article" : "WebPage",
      name: title,
      url: pageUrl,
      inLanguage: PUBLIC_LOCALES[locale].hreflang,
    };
    if (description) localizedPrimaryNode.description = description;
    const jsonLd = pageGraphJsonLd(
      localizedPrimaryNode,
      [{ name: "Shopeando", url: `${SITE_URL}${localizedPath("/", locale)}` }, { name: title, url: pageUrl }],
    );
    let html = buildHead({ html: template, title: `${seoTitle} | Shopeando`, description, canonical: pageUrl, ogImage: entity.imageUrl ? `${SITE_URL}${entity.imageUrl}` : defaultOgImage, jsonLd });
    const relatedLinks = kind === "mall" ? [
      {
        label: localizedCopy[locale].relatedRoutes,
        items: routes.filter((route) => route.stops.some((stop) => stop.mallId === sourceEntity.id)).map((route) => ({
          name: localizeRoute(route, locale).title,
          url: `${SITE_URL}${localizedPath(`/rutas/${route.id}/`, locale)}`,
        })),
      },
      {
        label: localizedCopy[locale].relatedGuides,
        items: guides.filter((guide) => guide.relatedMalls?.includes(sourceEntity.id)).map((guide) => ({
          name: localizeGuide(guide, locale).title,
          url: `${SITE_URL}${localizedPath(`/guias/${guide.id}/`, locale)}`,
        })),
      },
      {
        label: localizedCopy[locale].relatedComparisons,
        items: comparisons.filter((comparison) => comparison.mallIds?.includes(sourceEntity.id)).map((comparison) => ({
          name: localizeComparison(comparison, locale).title,
          url: `${SITE_URL}${localizedPath(`/comparar/${comparison.id}/`, locale)}`,
        })),
      },
    ] : [];
    html = replaceBody(html, buildLocalizedBody({ locale, title, description, entity, path, relatedLinks }));
    writeHtml(`dist${localizedPath(path, locale)}index.html`, html);
    count++;
  }
}

console.log(`✅ Pre-rendered ${count} pages total:`);
console.log(`   ${mallPages.length} mall pages → dist/malls/[id]/`);
console.log(`   ${outletPages.length} outlet pages → dist/outlets/[id]/`);
console.log(`   1 malls index, 1 outlets index`);
console.log(`   ${routes.length} route pages → dist/rutas/[id]/`);
console.log(`   1 rutas index`);
console.log(`   ${guides.length} guide pages → dist/guias/[id]/`);
console.log(`   1 guias index`);
console.log(`   ${comparisons.length} comparison pages → dist/comparar/[id]/`);
console.log(`   1 comparar index`);
console.log(`   ${malls.length} legacy noindex redirects → dist/mall/[id]/`);
console.log(`   Portuguese and English equivalents → dist/pt-br/ and dist/en/`);
