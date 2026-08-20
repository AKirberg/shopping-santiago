#!/usr/bin/env node
/**
 * validate-seo-pages.js
 * Validates that all expected SEO pages exist in dist/ and have:
 *   - A non-empty <title>
 *   - A meta description
 *   - A canonical link
 *   - For noindex pages: noindex meta and meta refresh
 *   - For canonical pages: NOT noindex
 *   - Sitemap URLs do NOT include /mall/:id legacy paths
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { localizedPath, publicAlternates } from "../src/utils/publicLocales.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── load data ──────────────────────────────────────────────────────────────

const malls = JSON.parse(readFileSync(resolve(ROOT, "src/data/malls.json"), "utf-8"));
const routes = JSON.parse(readFileSync(resolve(ROOT, "src/data/routes.json"), "utf-8"));
const guides = JSON.parse(readFileSync(resolve(ROOT, "src/data/guides.json"), "utf-8"));
const comparisons = JSON.parse(readFileSync(resolve(ROOT, "src/data/comparisons.json"), "utf-8"));

const mallPages = malls.filter((m) => !m.outlet);
const outletPages = malls.filter((m) => m.outlet);

const SITE_URL = "https://www.shopeando.cl";

const translatablePages = [
  { path: "malls/index.html", urlPath: "/malls/" },
  { path: "outlets/index.html", urlPath: "/outlets/" },
  { path: "rutas/index.html", urlPath: "/rutas/" },
  { path: "guias/index.html", urlPath: "/guias/" },
  { path: "comparar/index.html", urlPath: "/comparar/" },
  ...mallPages.map((m) => ({ path: `malls/${m.id}/index.html`, urlPath: `/malls/${m.id}/` })),
  ...outletPages.map((m) => ({ path: `outlets/${m.id}/index.html`, urlPath: `/outlets/${m.id}/` })),
  ...routes.map((r) => ({ path: `rutas/${r.id}/index.html`, urlPath: `/rutas/${r.id}/` })),
  ...guides.map((g) => ({ path: `guias/${g.id}/index.html`, urlPath: `/guias/${g.id}/` })),
  ...comparisons.map((c) => ({ path: `comparar/${c.id}/index.html`, urlPath: `/comparar/${c.id}/` })),
];

// ── expected pages ─────────────────────────────────────────────────────────

const canonicalPages = [
  // Static
  { path: "dist/index.html", url: `${SITE_URL}/`, noindex: false },
  { path: "dist/pt-br/index.html", url: `${SITE_URL}/pt-br/`, noindex: false },
  { path: "dist/en/index.html", url: `${SITE_URL}/en/`, noindex: false },
  // Indexes
  { path: "dist/malls/index.html", url: `${SITE_URL}/malls/`, noindex: false },
  { path: "dist/outlets/index.html", url: `${SITE_URL}/outlets/`, noindex: false },
  { path: "dist/rutas/index.html", url: `${SITE_URL}/rutas/`, noindex: false },
  { path: "dist/guias/index.html", url: `${SITE_URL}/guias/`, noindex: false },
  { path: "dist/comparar/index.html", url: `${SITE_URL}/comparar/`, noindex: false },
  // Mall pages
  ...mallPages.map((m) => ({
    path: `dist/malls/${m.id}/index.html`,
    url: `${SITE_URL}/malls/${m.id}/`,
    noindex: false,
  })),
  // Outlet pages
  ...outletPages.map((m) => ({
    path: `dist/outlets/${m.id}/index.html`,
    url: `${SITE_URL}/outlets/${m.id}/`,
    noindex: false,
  })),
  // Route pages
  ...routes.map((r) => ({
    path: `dist/rutas/${r.id}/index.html`,
    url: `${SITE_URL}/rutas/${r.id}/`,
    noindex: false,
  })),
  // Guide pages
  ...guides.map((g) => ({
    path: `dist/guias/${g.id}/index.html`,
    url: `${SITE_URL}/guias/${g.id}/`,
    noindex: false,
  })),
  // Comparison pages
  ...comparisons.map((c) => ({
    path: `dist/comparar/${c.id}/index.html`,
    url: `${SITE_URL}/comparar/${c.id}/`,
    noindex: false,
  })),
  ...["pt", "en"].flatMap((locale) => translatablePages.map((page) => ({
    path: `dist${localizedPath(`/${page.path.replace(/index\.html$/, "")}`, locale)}index.html`,
    url: `${SITE_URL}${localizedPath(page.urlPath, locale)}`,
    noindex: false,
  }))),
  // Legacy noindex redirects
  ...malls.map((m) => ({
    path: `dist/mall/${m.id}/index.html`,
    url: `${SITE_URL}/mall/${m.id}/`,
    noindex: true,
    redirectsTo: m.outlet ? `${SITE_URL}/outlets/${m.id}/` : `${SITE_URL}/malls/${m.id}/`,
  })),
];

// ── validation logic ───────────────────────────────────────────────────────

let errors = 0;
let warnings = 0;
let checked = 0;
const canonicalTitles = new Map();
const canonicalDescriptions = new Map();

function err(msg) {
  console.error(`  ❌ ${msg}`);
  errors++;
}

function warn(msg) {
  console.warn(`  ⚠️  ${msg}`);
  warnings++;
}

function getAttribute(tag, attribute) {
  return tag?.match(new RegExp(`${attribute}=[\"']([^\"']+)[\"']`, "i"))?.[1] ?? null;
}

function checkPage(page) {
  const fullPath = resolve(ROOT, page.path);
  if (!existsSync(fullPath)) {
    err(`Missing: ${page.path}`);
    return;
  }

  const html = readFileSync(fullPath, "utf-8");

  // Title check
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch || !titleMatch[1].trim()) {
    err(`${page.path}: missing or empty <title>`);
  } else if (!page.noindex) {
    const title = titleMatch[1].trim();
    if (canonicalTitles.has(title)) {
      err(`${page.path}: duplicate title also used by ${canonicalTitles.get(title)}`);
    } else {
      canonicalTitles.set(title, page.path);
    }
  }

  // Description check
  const descriptionTag = html.match(/<meta[^>]+name=["']description["'][^>]*>/i)?.[0];
  const description = getAttribute(descriptionTag, "content");
  if (!description) {
    err(`${page.path}: missing meta description`);
  } else if (!page.noindex) {
    if (canonicalDescriptions.has(description)) {
      err(`${page.path}: duplicate description also used by ${canonicalDescriptions.get(description)}`);
    } else {
      canonicalDescriptions.set(description, page.path);
    }
  }

  // Canonical check
  const canonicalTag = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0];
  const canonicalHref = getAttribute(canonicalTag, "href");
  if (!canonicalHref) {
    err(`${page.path}: missing canonical link`);
  } else {
    const expectedCanonical = page.redirectsTo || page.url;
    if (canonicalHref !== expectedCanonical) {
      err(`${page.path}: canonical is ${canonicalHref}, expected ${expectedCanonical}`);
    }
  }

  const ogUrlTag = html.match(/<meta[^>]+property=["']og:url["'][^>]*>/i)?.[0];
  const ogUrl = getAttribute(ogUrlTag, "content");
  if (!page.noindex && ogUrl !== page.url) {
    err(`${page.path}: og:url is ${ogUrl || "missing"}, expected ${page.url}`);
  }

  if (page.noindex) {
    // Should have noindex
    if (!html.includes("noindex")) {
      err(`${page.path}: legacy page missing noindex`);
    }
    // Should have meta refresh to canonical
    if (page.redirectsTo && !html.includes(page.redirectsTo)) {
      err(`${page.path}: legacy page missing redirect to ${page.redirectsTo}`);
    }
    // Should NOT appear in sitemap (checked separately below)
  } else {
    // Should NOT have noindex
    if (html.includes("noindex")) {
      err(`${page.path}: canonical page should NOT have noindex`);
    }
    // JSON-LD check
    if (!html.includes('type="application/ld+json"')) {
      err(`${page.path}: missing JSON-LD`);
    }

    const generatedPage = !["dist/index.html", "dist/pt-br/index.html", "dist/en/index.html"].includes(page.path);
    if (generatedPage) {
      if (!html.includes('data-prerendered="true"')) {
        err(`${page.path}: missing prerendered initial HTML`);
      }
      if (!/<h1[\s>]/i.test(html)) {
        err(`${page.path}: missing visible h1`);
      }
      if (!html.includes('aria-label="Breadcrumb"')) {
        err(`${page.path}: missing visible breadcrumb`);
      }
      if (!html.includes('"@type": "BreadcrumbList"')) {
        err(`${page.path}: missing BreadcrumbList JSON-LD`);
      }
    }

    const basePath = new URL(page.url).pathname.replace(/^\/(pt-br|en)(?=\/|$)/, "") || "/";
    const expectedAlternates = [
      ...publicAlternates(basePath).map(({ hreflang, path }) => ({ hreflang, href: `${SITE_URL}${path}` })),
      { hreflang: "x-default", href: `${SITE_URL}${localizedPath(basePath, "es")}` },
    ];
    for (const alternate of expectedAlternates) {
      const alternatePattern = new RegExp(
        `<link[^>]+hreflang=["']${alternate.hreflang}["'][^>]+href=["']${alternate.href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>|` +
        `<link[^>]+href=["']${alternate.href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]+hreflang=["']${alternate.hreflang}["'][^>]*>`,
        "i",
      );
      if (!alternatePattern.test(html)) {
        err(`${page.path}: missing hreflang ${alternate.hreflang} → ${alternate.href}`);
      }
    }

    const expectedLang = page.url.includes("/pt-br/") ? "pt-BR" : page.url.includes("/en/") ? "en" : null;
    if (expectedLang && !new RegExp(`<html[^>]+lang=["']${expectedLang}["']`, "i").test(html)) {
      err(`${page.path}: html lang should be ${expectedLang}`);
    }
  }

  checked++;
}

function titleFromHtml(html) {
  return html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ?? "";
}

async function startProductionServer() {
  const child = spawn(process.execPath, ["server.mjs"], {
    cwd: ROOT,
    env: { ...process.env, NODE_ENV: "production", PORT: "0", DATABASE_URL: "" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";

  const port = await new Promise((resolvePort, reject) => {
    const timeout = setTimeout(() => reject(new Error(`production server did not start: ${output}`)), 10000);
    const onOutput = (chunk) => {
      output += chunk.toString();
      const match = output.match(/Shopeando is listening on port (\d+)/);
      if (match) {
        clearTimeout(timeout);
        resolvePort(Number(match[1]));
      }
    };
    child.stdout.on("data", onOutput);
    child.stderr.on("data", onOutput);
    child.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`production server exited early (${code}): ${output}`));
    });
  });

  return { child, port };
}

async function validateProductionRoutes() {
  console.log("🌐 Verifying canonical URLs through the production server...");
  let server;
  try {
    server = await startProductionServer();
    for (const page of canonicalPages.filter((candidate) => !candidate.noindex)) {
      const urlPath = new URL(page.url).pathname;
      const response = await fetch(`http://127.0.0.1:${server.port}${urlPath}`);
      if (!response.ok) {
        err(`${urlPath}: production server returned ${response.status}`);
        continue;
      }

      const html = await response.text();
      const expectedHtml = readFileSync(resolve(ROOT, page.path), "utf-8");
      if (titleFromHtml(html) !== titleFromHtml(expectedHtml)) {
        err(`${urlPath}: production server did not return its prerendered title`);
      }
      if (!html.includes(`rel="canonical" href="${page.url}"`)) {
        err(`${urlPath}: production server did not return its canonical URL`);
      }

      const basePath = new URL(page.url).pathname.replace(/^\/(pt-br|en)(?=\/|$)/, "") || "/";
      for (const alternate of publicAlternates(basePath)) {
        const expectedHref = `${SITE_URL}${alternate.path}`;
        if (!html.includes(`hreflang="${alternate.hreflang}" href="${expectedHref}"`)) {
          err(`${urlPath}: production server missing hreflang ${alternate.hreflang}`);
        }
      }
      if (!html.includes(`hreflang="x-default" href="${SITE_URL}${localizedPath(basePath, "es")}"`)) {
        err(`${urlPath}: production server missing x-default hreflang`);
      }

      const generatedPage = !["dist/index.html", "dist/pt-br/index.html", "dist/en/index.html"].includes(page.path);
      if (generatedPage && !html.includes('data-prerendered="true"')) {
        err(`${urlPath}: production server did not return prerendered body`);
      }
    }
  } catch (error) {
    err(`Could not verify production SEO routes: ${error.message}`);
  } finally {
    if (server?.child && !server.child.killed) {
      server.child.kill("SIGTERM");
      await new Promise((resolveExit) => server.child.once("exit", resolveExit));
    }
  }
}

console.log("🔍 Validating SEO pages...\n");

for (const page of canonicalPages) {
  checkPage(page);
}

// ── sitemap validation ─────────────────────────────────────────────────────

const sitemapPath = resolve(ROOT, "public/sitemap.xml");
if (existsSync(sitemapPath)) {
  const sitemap = readFileSync(sitemapPath, "utf-8");

  // Should NOT contain /mall/ legacy URLs
  const legacyInSitemap = malls.filter((m) => sitemap.includes(`/mall/${m.id}`));
  if (legacyInSitemap.length > 0) {
    err(`Sitemap contains legacy /mall/ URLs: ${legacyInSitemap.map(m => m.id).join(", ")}`);
  }

  // Should contain new /malls/ and /outlets/ URLs
  const missingInSitemap = [];
  for (const m of mallPages) {
    if (!sitemap.includes(`/malls/${m.id}`)) missingInSitemap.push(`/malls/${m.id}`);
  }
  for (const m of outletPages) {
    if (!sitemap.includes(`/outlets/${m.id}`)) missingInSitemap.push(`/outlets/${m.id}`);
  }
  if (missingInSitemap.length > 0) {
    err(`Sitemap missing canonical URLs: ${missingInSitemap.join(", ")}`);
  }

  // Count total URLs
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expectedUrls = canonicalPages.filter((page) => !page.noindex).map((page) => page.url);
  const duplicates = sitemapUrls.filter((url, index) => sitemapUrls.indexOf(url) !== index);
  if (duplicates.length > 0) {
    err(`Sitemap contains duplicate URLs: ${[...new Set(duplicates)].join(", ")}`);
  }
  const unexpectedUrls = sitemapUrls.filter((url) => !expectedUrls.includes(url));
  const absentUrls = expectedUrls.filter((url) => !sitemapUrls.includes(url));
  if (unexpectedUrls.length > 0) {
    err(`Sitemap contains unexpected URLs: ${unexpectedUrls.join(", ")}`);
  }
  if (absentUrls.length > 0) {
    err(`Sitemap is missing URLs: ${absentUrls.join(", ")}`);
  }

  const urlCount = sitemapUrls.length;
  console.log(`📄 Sitemap: ${urlCount} URLs`);
} else {
  warn("public/sitemap.xml not found");
}

await validateProductionRoutes();

// ── summary ────────────────────────────────────────────────────────────────

console.log(`\n📊 Summary: checked ${checked}/${canonicalPages.length} files`);

if (errors > 0) {
  console.error(`\n❌ Validation failed: ${errors} error(s), ${warnings} warning(s)`);
  process.exit(1);
} else if (warnings > 0) {
  console.warn(`\n⚠️  Validation passed with ${warnings} warning(s)`);
  process.exit(0);
} else {
  console.log(`\n✅ All ${checked} pages validated successfully`);
  process.exit(0);
}
