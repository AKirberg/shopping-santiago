#!/usr/bin/env node
/**
 * generate-sitemap.js
 * Generates public/sitemap.xml with canonical URLs only.
 * Legacy /mall/:id paths are NEVER included (noindex redirects).
 * Output is deterministic (sorted by loc).
 *
 * Run: node scripts/generate-sitemap.js
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { localizedPath } from "../src/utils/publicLocales.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const BASE_URL = "https://www.shopeando.cl";

// Fixed date for reproducible builds — update on significant content changes.
const CONTENT_DATE = "2026-08-19";

// ── load data ──────────────────────────────────────────────────────────────

const malls = JSON.parse(readFileSync(resolve(ROOT, "src/data/malls.json"), "utf-8"));
const routes = JSON.parse(readFileSync(resolve(ROOT, "src/data/routes.json"), "utf-8"));
const guides = JSON.parse(readFileSync(resolve(ROOT, "src/data/guides.json"), "utf-8"));
const comparisons = JSON.parse(readFileSync(resolve(ROOT, "src/data/comparisons.json"), "utf-8"));

const mallPages = malls.filter((m) => !m.outlet);
const outletPages = malls.filter((m) => m.outlet);

// ── build URL list ──────────────────────────────────────────────────────────

const staticUrls = [
  { loc: `${BASE_URL}/`,          lastmod: CONTENT_DATE, changefreq: "monthly", priority: "1.0" },
  { loc: `${BASE_URL}/pt-br/`,    lastmod: CONTENT_DATE, changefreq: "monthly", priority: "0.9" },
  { loc: `${BASE_URL}/en/`,       lastmod: CONTENT_DATE, changefreq: "monthly", priority: "0.9" },
  { loc: `${BASE_URL}/malls/`,    lastmod: CONTENT_DATE, changefreq: "monthly", priority: "0.8" },
  { loc: `${BASE_URL}/outlets/`,  lastmod: CONTENT_DATE, changefreq: "monthly", priority: "0.8" },
  { loc: `${BASE_URL}/rutas/`,    lastmod: CONTENT_DATE, changefreq: "monthly", priority: "0.7" },
  { loc: `${BASE_URL}/guias/`,    lastmod: CONTENT_DATE, changefreq: "monthly", priority: "0.7" },
  { loc: `${BASE_URL}/comparar/`, lastmod: CONTENT_DATE, changefreq: "monthly", priority: "0.7" },
];

const mallUrls = mallPages.map((m) => ({
  loc: `${BASE_URL}/malls/${m.id}/`,
  lastmod: CONTENT_DATE,
  changefreq: "monthly",
  priority: "0.8",
}));

const outletUrls = outletPages.map((m) => ({
  loc: `${BASE_URL}/outlets/${m.id}/`,
  lastmod: CONTENT_DATE,
  changefreq: "monthly",
  priority: "0.8",
}));

const routeUrls = routes.map((r) => ({
  loc: `${BASE_URL}/rutas/${r.id}/`,
  lastmod: CONTENT_DATE,
  changefreq: "monthly",
  priority: "0.7",
}));

const guideUrls = guides.map((g) => ({
  loc: `${BASE_URL}/guias/${g.id}/`,
  lastmod: g.modifiedAt || CONTENT_DATE,
  changefreq: "monthly",
  priority: "0.7",
}));

const comparisonUrls = comparisons.map((c) => ({
  loc: `${BASE_URL}/comparar/${c.id}/`,
  lastmod: c.modifiedAt || CONTENT_DATE,
  changefreq: "monthly",
  priority: "0.7",
}));

const translatablePaths = [
  "/malls/", "/outlets/", "/rutas/", "/guias/", "/comparar/",
  ...mallPages.map((m) => `/malls/${m.id}/`),
  ...outletPages.map((m) => `/outlets/${m.id}/`),
  ...routes.map((r) => `/rutas/${r.id}/`),
  ...guides.map((g) => `/guias/${g.id}/`),
  ...comparisons.map((c) => `/comparar/${c.id}/`),
];
const localizedUrls = ["pt", "en"].flatMap((locale) => translatablePaths.map((path) => ({
  loc: `${BASE_URL}${localizedPath(path, locale)}`,
  lastmod: CONTENT_DATE,
  changefreq: "monthly",
  priority: path.split("/").filter(Boolean).length <= 1 ? "0.7" : "0.6",
})));

// Combine all canonical URLs — sorted deterministically by loc
const allUrls = [
  ...staticUrls,
  ...mallUrls,
  ...outletUrls,
  ...routeUrls,
  ...guideUrls,
  ...comparisonUrls,
  ...localizedUrls,
].sort((a, b) => a.loc.localeCompare(b.loc));

// ── render XML ──────────────────────────────────────────────────────────────

const urlEntries = allUrls
  .map(
    ({ loc, lastmod, changefreq, priority }) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

// ── write ───────────────────────────────────────────────────────────────────

const outPath = resolve(ROOT, "public/sitemap.xml");
writeFileSync(outPath, xml, "utf-8");

console.log(`✅ Sitemap written to ${outPath}`);
console.log(`   ${allUrls.length} canonical URLs total`);
console.log(`   Static: ${staticUrls.length}`);
console.log(`   Malls: ${mallUrls.length}`);
console.log(`   Outlets: ${outletUrls.length}`);
console.log(`   Routes: ${routeUrls.length}`);
console.log(`   Guides: ${guideUrls.length}`);
console.log(`   Comparisons: ${comparisonUrls.length}`);
console.log(`   ⚠️  Legacy /mall/:id URLs excluded (noindex redirects, not indexed)`);

// ── sanity check: no legacy URLs ────────────────────────────────────────────

const hasLegacy = allUrls.some((u) => /\/mall\/[^/]/.test(u.loc));
if (hasLegacy) {
  console.error("❌ ERROR: Legacy /mall/ URL found in sitemap — this should never happen!");
  process.exit(1);
}
