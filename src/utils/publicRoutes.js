/**
 * publicRoutes.js
 * Single source of truth for all canonical public URLs in Shopeando.
 * Used by the prerender script, sitemap generator, and validation script.
 */

import malls from "../data/malls.json" with { type: "json" };
import routes from "../data/routes.json" with { type: "json" };
import guides from "../data/guides.json" with { type: "json" };
import comparisons from "../data/comparisons.json" with { type: "json" };
import { localizedPath } from "./publicLocales.js";

export const BASE_URL = "https://www.shopeando.cl";

/** Malls sin outlet → /malls/:id */
export const mallPages = malls.filter((m) => !m.outlet);

/** Outlets → /outlets/:id */
export const outletPages = malls.filter((m) => m.outlet);

/** Rutas editoriales → /rutas/:id */
export const routePages = routes;

/** Guías editoriales → /guias/:id */
export const guidePages = guides;

/** Comparaciones curadas → /comparar/:id */
export const comparisonPages = comparisons;

export function mallPath(mall, locale = "es") {
  return localizedPath(`${mall.outlet ? "/outlets" : "/malls"}/${mall.id}/`, locale);
}

export function routePath(route, locale = "es") {
  return localizedPath(`/rutas/${route.id}/`, locale);
}

export function guidePath(guide, locale = "es") {
  return localizedPath(`/guias/${guide.id}/`, locale);
}

export function comparisonPath(comparison, locale = "es") {
  return localizedPath(`/comparar/${comparison.id}/`, locale);
}

/**
 * All canonical sitemap URLs (no legacy /mall/:id).
 * Sorted deterministically for reproducible sitemap output.
 */
export function getCanonicalUrls(today) {
  const date = today || new Date().toISOString().slice(0, 10);

  const staticUrls = [
    { loc: `${BASE_URL}/`, lastmod: date, changefreq: "monthly", priority: "1.0" },
    { loc: `${BASE_URL}/pt-br/`, lastmod: date, changefreq: "monthly", priority: "0.9" },
    { loc: `${BASE_URL}/en/`, lastmod: date, changefreq: "monthly", priority: "0.9" },
    { loc: `${BASE_URL}/malls/`, lastmod: date, changefreq: "monthly", priority: "0.8" },
    { loc: `${BASE_URL}/outlets/`, lastmod: date, changefreq: "monthly", priority: "0.8" },
    { loc: `${BASE_URL}/rutas/`, lastmod: date, changefreq: "monthly", priority: "0.7" },
    { loc: `${BASE_URL}/guias/`, lastmod: date, changefreq: "monthly", priority: "0.7" },
    { loc: `${BASE_URL}/comparar/`, lastmod: date, changefreq: "monthly", priority: "0.7" },
  ];

  const mallUrls = mallPages.map((m) => ({
    loc: `${BASE_URL}${mallPath(m)}`,
    lastmod: date,
    changefreq: "monthly",
    priority: "0.8",
  }));

  const outletUrls = outletPages.map((m) => ({
    loc: `${BASE_URL}${mallPath(m)}`,
    lastmod: date,
    changefreq: "monthly",
    priority: "0.8",
  }));

  const routeUrls = routePages.map((r) => ({
    loc: `${BASE_URL}${routePath(r)}`,
    lastmod: date,
    changefreq: "monthly",
    priority: "0.7",
  }));

  const guideUrls = guidePages.map((g) => ({
    loc: `${BASE_URL}${guidePath(g)}`,
    lastmod: date,
    changefreq: "monthly",
    priority: "0.7",
  }));

  const comparisonUrls = comparisonPages.map((c) => ({
    loc: `${BASE_URL}${comparisonPath(c)}`,
    lastmod: date,
    changefreq: "monthly",
    priority: "0.7",
  }));

  const originals = [...mallUrls, ...outletUrls, ...routeUrls, ...guideUrls, ...comparisonUrls];
  const translated = ["pt", "en"].flatMap((locale) => originals.map((entry) => ({
    ...entry,
    loc: `${BASE_URL}${localizedPath(new URL(entry.loc).pathname, locale)}`,
  })));
  return [...staticUrls, ...originals, ...translated];
}

/**
 * Returns all expected dist output paths for validation.
 * Includes legacy /mall/:id noindex redirects (not in sitemap).
 */
export function getExpectedDistPaths() {
  const canonical = getCanonicalUrls().map((u) => {
    const path = u.loc.replace(BASE_URL, "");
    // Convert /foo/ to dist/foo/index.html, /foo/bar to dist/foo/bar/index.html
    return "dist" + (path.endsWith("/") ? path + "index.html" : path + "/index.html");
  });

  // Legacy noindex redirects
  const legacy = malls.map((m) => `dist/mall/${m.id}/index.html`);

  return [...canonical, ...legacy];
}
