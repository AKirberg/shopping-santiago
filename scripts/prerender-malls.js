#!/usr/bin/env node
/**
 * prerender-malls.js
 * Post-build script: generates dist/mall/[slug]/index.html for every mall
 * with title, meta description, OG tags, JSON-LD and semantic body content
 * already present in the HTML so Google and social crawlers see the content
 * without executing JavaScript.
 *
 * React mounts into #root and enhances the page interactively.
 *
 * Usage (called automatically by `npm run build`):
 *   node scripts/prerender-malls.js
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const SITE_URL = "https://www.shopeando.cl";

// ── helpers ────────────────────────────────────────────────────────────────

function mallUrl(mall) {
  return `${SITE_URL}/mall/${mall.id}`;
}

function mallTitle(mall) {
  return `${mall.name} · Horarios, tiendas y cómo llegar | Shopeando`;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s) {
  return escapeHtml(s);
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── JSON-LD builder (mirrors mallSeo.js) ──────────────────────────────────

function buildMallJsonLd(mall) {
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
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      mall.mapsQuery || `${mall.name} Santiago`
    )}`,
    isAccessibleForFree: true,
  };

  if (typeof mall.lat === "number" && typeof mall.lng === "number") {
    jsonLd.geo = {
      "@type": "GeoCoordinates",
      latitude: mall.lat,
      longitude: mall.lng,
    };
  }
  if (mall.imageUrl) jsonLd.image = `${SITE_URL}${mall.imageUrl}`;
  if (mall.officialUrl) jsonLd.sameAs = [mall.officialUrl];
  if (mall.priceLevel) {
    jsonLd.priceRange =
      mall.priceLevel === "alto" ? "$$$" : mall.priceLevel === "medio" ? "$$" : "$";
  }
  if (mall.stores?.length) {
    jsonLd.containsPlace = mall.stores.slice(0, 20).map((store) => ({
      "@type": "Store",
      name: store.name,
    }));
  }
  return jsonLd;
}

// ── semantic body builder ──────────────────────────────────────────────────

function priceLevelLabel(level) {
  if (level === "alto") return "Premium ($$$ — marcas de lujo)";
  if (level === "medio") return "Precio medio ($$ — variedad de rangos)";
  if (level === "economico") return "Económico ($ — precios accesibles)";
  return null;
}

function transportLines(transport) {
  const lines = [];
  if (transport?.metro) lines.push(`Metro: ${transport.metro}`);
  if (transport?.uber) lines.push("Accesible en Uber / taxi");
  if (transport?.parking) lines.push("Estacionamiento disponible");
  if (transport?.bus) lines.push(`Bus: ${transport.bus}`);
  return lines;
}

function buildMallBody(mall) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    mall.mapsQuery || `${mall.name} Santiago`
  )}`;

  let html = `<main id="root" data-prerendered="true" style="font-family:sans-serif;max-width:800px;margin:0 auto;padding:1rem 1.5rem">`;

  // ── nav ──
  html += `\n  <nav><a href="${SITE_URL}" style="color:#2563eb">← Todos los malls</a></nav>`;

  // ── header ──
  html += `\n  <header style="margin-top:1rem">`;
  if (mall.imageUrl) {
    html += `\n    <img src="${escapeAttr(SITE_URL + mall.imageUrl)}" alt="${escapeAttr(mall.name)}" width="800" height="400" style="width:100%;height:auto;border-radius:8px;object-fit:cover" loading="lazy" />`;
  }
  html += `\n    <h1 style="margin:.75rem 0 .25rem">${escapeHtml(mall.name)}</h1>`;
  html += `\n    <p style="margin:0;color:#555">${escapeHtml(mall.commune)}, Santiago de Chile &nbsp;·&nbsp; <a href="${escapeAttr(mapsUrl)}" target="_blank" rel="noopener noreferrer" style="color:#2563eb">Ver en Google Maps</a></p>`;
  html += `\n  </header>`;

  // ── description ──
  if (mall.description) {
    html += `\n  <section aria-label="Descripción" style="margin-top:1rem">`;
    html += `\n    <p style="font-size:1.05rem;line-height:1.6">${escapeHtml(mall.description)}</p>`;
    html += `\n  </section>`;
  }

  // ── key facts ──
  const facts = [];
  if (mall.recommendedTime) facts.push(`<strong>Tiempo recomendado:</strong> ${escapeHtml(mall.recommendedTime)}`);
  const priceLabel = priceLevelLabel(mall.priceLevel);
  if (priceLabel) facts.push(`<strong>Nivel de precios:</strong> ${escapeHtml(priceLabel)}`);
  if (mall.touristScore != null) facts.push(`<strong>Puntuación turística:</strong> ${mall.touristScore}/10`);
  if (mall.familyFriendly) facts.push(`<strong>Apto para familias:</strong> Sí`);
  if (mall.outlet) facts.push(`<strong>Outlet:</strong> Sí`);
  if (mall.premium) facts.push(`<strong>Premium:</strong> Sí`);

  if (facts.length) {
    html += `\n  <section aria-label="Información clave" style="margin-top:1.25rem">`;
    html += `\n    <h2 style="font-size:1.1rem;margin-bottom:.5rem">Información</h2>`;
    html += `\n    <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.35rem">`;
    for (const f of facts) html += `\n      <li>${f}</li>`;
    html += `\n    </ul>`;
    html += `\n  </section>`;
  }

  // ── transport ──
  const transportItems = transportLines(mall.transport);
  if (transportItems.length) {
    html += `\n  <section aria-label="Cómo llegar" style="margin-top:1.25rem">`;
    html += `\n    <h2 style="font-size:1.1rem;margin-bottom:.5rem">Cómo llegar</h2>`;
    html += `\n    <ul style="list-style:disc;padding-left:1.25rem;margin:0;display:flex;flex-direction:column;gap:.25rem">`;
    for (const t of transportItems) html += `\n      <li>${escapeHtml(t)}</li>`;
    html += `\n    </ul>`;
    html += `\n  </section>`;
  }

  // ── best for ──
  if (mall.bestFor?.length) {
    html += `\n  <section aria-label="Ideal para" style="margin-top:1.25rem">`;
    html += `\n    <h2 style="font-size:1.1rem;margin-bottom:.5rem">Ideal para</h2>`;
    html += `\n    <ul style="list-style:disc;padding-left:1.25rem;margin:0;display:flex;flex-direction:column;gap:.25rem">`;
    for (const b of mall.bestFor) html += `\n      <li>${escapeHtml(b)}</li>`;
    html += `\n    </ul>`;
    html += `\n  </section>`;
  }

  // ── stores ──
  if (mall.stores?.length) {
    html += `\n  <section aria-label="Tiendas" style="margin-top:1.25rem">`;
    html += `\n    <h2 style="font-size:1.1rem;margin-bottom:.5rem">Tiendas destacadas</h2>`;
    html += `\n    <ul style="list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:.4rem">`;
    for (const store of mall.stores) {
      html += `\n      <li style="background:#f1f5f9;padding:.2rem .6rem;border-radius:4px;font-size:.9rem">${escapeHtml(store.name)}</li>`;
    }
    html += `\n    </ul>`;
    html += `\n  </section>`;
  }

  // ── nearby attractions ──
  if (mall.nearbyAttractions?.length) {
    html += `\n  <section aria-label="Atracciones cercanas" style="margin-top:1.25rem">`;
    html += `\n    <h2 style="font-size:1.1rem;margin-bottom:.5rem">Atracciones cercanas</h2>`;
    html += `\n    <ul style="list-style:disc;padding-left:1.25rem;margin:0;display:flex;flex-direction:column;gap:.25rem">`;
    for (const a of mall.nearbyAttractions) html += `\n      <li>${escapeHtml(a)}</li>`;
    html += `\n    </ul>`;
    html += `\n  </section>`;
  }

  // ── tips ──
  if (mall.tips?.length) {
    html += `\n  <section aria-label="Consejos" style="margin-top:1.25rem">`;
    html += `\n    <h2 style="font-size:1.1rem;margin-bottom:.5rem">Consejos</h2>`;
    html += `\n    <ul style="list-style:disc;padding-left:1.25rem;margin:0;display:flex;flex-direction:column;gap:.25rem">`;
    for (const t of mall.tips) html += `\n      <li>${escapeHtml(t)}</li>`;
    html += `\n    </ul>`;
    html += `\n  </section>`;
  }

  // ── official link ──
  if (mall.officialUrl) {
    html += `\n  <p style="margin-top:1.25rem"><a href="${escapeAttr(mall.officialUrl)}" target="_blank" rel="noopener noreferrer" style="color:#2563eb">Sitio oficial de ${escapeHtml(mall.name)} →</a></p>`;
  }

  html += `\n</main>`;
  return html;
}

// ── string-replace helpers ─────────────────────────────────────────────────

function replaceMeta(html, selector, newContent) {
  const tagRe = new RegExp(
    `(<(?:meta|link)[^>]*${escapeRe(selector)}[^>]*(?:content|href)=)["']([^"']*)["']`,
    "i"
  );
  return html.replace(tagRe, `$1"${escapeAttr(newContent)}"`);
}

function replaceTitle(html, newTitle) {
  return html.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(newTitle)}</title>`);
}

/** Replace existing JSON-LD block and inject fresh one before </head>. */
function replaceJsonLd(html, newJsonLd) {
  const stripped = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    ""
  );
  const injection = `\n    <script type="application/ld+json">\n    ${JSON.stringify(
    newJsonLd,
    null,
    2
  ).replace(/\n/g, "\n    ")}\n    </script>`;
  return stripped.replace("</head>", `${injection}\n  </head>`);
}

/** Replace the SPA shell body with semantic pre-rendered content. */
function replaceBody(html, bodyContent) {
  return html.replace(/<body>[\s\S]*?<\/body>/, `<body>\n${bodyContent}\n  </body>`);
}

// ── main ───────────────────────────────────────────────────────────────────

const distIndex = resolve(ROOT, "dist/index.html");
const mallsPath = resolve(ROOT, "src/data/malls.json");

let template;
try {
  template = readFileSync(distIndex, "utf-8");
} catch {
  console.error("❌ dist/index.html not found — run `vite build` first.");
  process.exit(1);
}

const malls = JSON.parse(readFileSync(mallsPath, "utf-8"));

let count = 0;

for (const mall of malls) {
  const url = mallUrl(mall);
  const title = mallTitle(mall);
  const description = mall.description || "";
  const image = mall.imageUrl
    ? `${SITE_URL}${mall.imageUrl}`
    : `${SITE_URL}/images/og-image.png`;

  let html = template;

  // Head: title + meta tags
  html = replaceTitle(html, title);
  html = replaceMeta(html, 'name="description"', description);
  html = replaceMeta(html, 'rel="canonical"', url);
  html = replaceMeta(html, 'property="og:url"', url);
  html = replaceMeta(html, 'property="og:title"', title);
  html = replaceMeta(html, 'property="og:description"', description);
  html = replaceMeta(html, 'property="og:image"', image);
  html = replaceMeta(html, 'name="twitter:title"', title);
  html = replaceMeta(html, 'name="twitter:description"', description);
  html = replaceMeta(html, 'name="twitter:image"', image);

  // Head: JSON-LD
  html = replaceJsonLd(html, buildMallJsonLd(mall));

  // Body: semantic content (React hydrates/replaces on load)
  html = replaceBody(html, buildMallBody(mall));

  // Write file
  const outDir = resolve(ROOT, "dist/mall", mall.id);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, "index.html"), html, "utf-8");
  count++;
}

console.log(`✅ Pre-rendered ${count} mall pages → dist/mall/[slug]/index.html`);
