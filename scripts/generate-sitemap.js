#!/usr/bin/env node
/**
 * generate-sitemap.js
 * Generates public/sitemap.xml from src/data/malls.json.
 * Run manually or as part of the build:  node scripts/generate-sitemap.js
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const BASE_URL = "https://www.shopeando.cl";
const today = new Date().toISOString().slice(0, 10);

const malls = JSON.parse(
  readFileSync(resolve(ROOT, "src/data/malls.json"), "utf-8")
);

const staticUrls = [
  {
    loc: `${BASE_URL}/`,
    lastmod: today,
    changefreq: "monthly",
    priority: "1.0",
  },
  {
    loc: `${BASE_URL}/pt-br/`,
    lastmod: today,
    changefreq: "monthly",
    priority: "0.9",
  },
];

const mallUrls = malls.map((mall) => ({
  loc: `${BASE_URL}/mall/${mall.id}`,
  lastmod: today,
  changefreq: "monthly",
  priority: "0.8",
}));

const allUrls = [...staticUrls, ...mallUrls];

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

const outPath = resolve(ROOT, "public/sitemap.xml");
writeFileSync(outPath, xml, "utf-8");
console.log(`✅ Sitemap written to ${outPath}`);
console.log(`   ${allUrls.length} URLs (${staticUrls.length} static + ${mallUrls.length} malls)`);
