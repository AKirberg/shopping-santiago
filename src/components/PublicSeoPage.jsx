/**
 * PublicSeoPage.jsx
 * Renders all canonical public SEO pages without React Router.
 * Handles: /malls/, /malls/:id, /outlets/, /outlets/:id,
 *           /rutas/, /rutas/:id, /guias/, /guias/:id,
 *           /comparar/, /comparar/:id, /mall/:id (legacy redirect)
 */

import { useEffect } from "react";
import { ExternalLink, MapPin, Clock, Car, TrainFront, ShoppingBag, ChevronRight, Star, Route } from "lucide-react";
import malls from "../data/malls.json";
import routes from "../data/routes.json";
import guides from "../data/guides.json";
import comparisons from "../data/comparisons.json";
import { mallMapsUrl, routeMapsUrl } from "../utils/maps";
import { comparisonPath, guidePath, mallPath, routePath } from "../utils/publicRoutes";
import Header from "./Header";
import Footer from "./Footer";
import ReviewSection, { ReviewSummary } from "./ReviewSection";

const SITE_URL = "https://www.shopeando.cl";
const HAS_PRERENDERED_HEAD =
  typeof document !== "undefined" &&
  document.getElementById("root")?.dataset.prerendered === "true";

function canonicalUrl(url) {
  return url.endsWith("/") ? url : `${url}/`;
}

// ─── SEO helpers ─────────────────────────────────────────────────────────────

function setMeta(selector, attr, value) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

function setPageSeo({ title, description, canonical, ogImage }) {
  // Production pages already ship with a complete, page-specific head.
  // Keeping it intact avoids client-side canonical or JSON-LD drift.
  if (HAS_PRERENDERED_HEAD) return;
  const normalizedCanonical = canonicalUrl(canonical);
  document.title = title;
  setMeta('meta[name="description"]', "content", description);
  setMeta('link[rel="canonical"]', "href", normalizedCanonical);
  setMeta('meta[property="og:url"]', "content", normalizedCanonical);
  setMeta('meta[property="og:title"]', "content", title);
  setMeta('meta[property="og:description"]', "content", description);
  if (ogImage) setMeta('meta[property="og:image"]', "content", ogImage);
  setMeta('meta[name="twitter:title"]', "content", title);
  setMeta('meta[name="twitter:description"]', "content", description);

  // Remove any old JSON-LD from mall modal
  document.getElementById("mall-jsonld")?.remove();
}

function injectJsonLd(id, data) {
  if (HAS_PRERENDERED_HEAD) return;
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

function removeJsonLd(id) {
  if (HAS_PRERENDERED_HEAD) return;
  document.getElementById(id)?.remove();
}

// ─── Route parsing ────────────────────────────────────────────────────────────

const mallPages = malls.filter((m) => !m.outlet);
const outletPages = malls.filter((m) => m.outlet);
const mallMap = Object.fromEntries(malls.map((m) => [m.id, m]));

export function matchPublicRoute(pathname) {
  // Strip trailing slash for matching (except root)
  const p = pathname === "/" ? "/" : pathname.replace(/\/$/, "");

  // Hub indexes
  if (p === "/malls") return { type: "hub", hub: "malls" };
  if (p === "/outlets") return { type: "hub", hub: "outlets" };
  if (p === "/rutas") return { type: "hub", hub: "rutas" };
  if (p === "/guias") return { type: "hub", hub: "guias" };
  if (p === "/comparar") return { type: "hub", hub: "comparar" };

  // Detail pages
  const mallMatch = p.match(/^\/malls\/([^/]+)$/);
  if (mallMatch) {
    const mall = mallPages.find((m) => m.id === mallMatch[1]);
    if (mall) return { type: "mall-detail", mall, isOutlet: false };
  }

  const outletMatch = p.match(/^\/outlets\/([^/]+)$/);
  if (outletMatch) {
    const mall = outletPages.find((m) => m.id === outletMatch[1]);
    if (mall) return { type: "mall-detail", mall, isOutlet: true };
  }

  const rutaMatch = p.match(/^\/rutas\/([^/]+)$/);
  if (rutaMatch) {
    const route = routes.find((r) => r.id === rutaMatch[1]);
    if (route) return { type: "ruta-detail", route };
  }

  const guiaMatch = p.match(/^\/guias\/([^/]+)$/);
  if (guiaMatch) {
    const guide = guides.find((g) => g.id === guiaMatch[1]);
    if (guide) return { type: "guia-detail", guide };
  }

  const compMatch = p.match(/^\/comparar\/([^/]+)$/);
  if (compMatch) {
    const comparison = comparisons.find((c) => c.id === compMatch[1]);
    if (comparison) return { type: "comparar-detail", comparison };
  }

  // Legacy /mall/:id → redirect silently (treat as mall detail)
  const legacyMatch = p.match(/^\/mall\/([^/]+)$/);
  if (legacyMatch) {
    const mall = malls.find((m) => m.id === legacyMatch[1]);
    if (mall) return { type: "legacy-mall", mall };
  }

  return null;
}

// ─── Shared layout ────────────────────────────────────────────────────────────

function PageShell({ children, breadcrumbs }) {
  return (
    <div className="min-h-screen bg-[#f8faf6] text-ink">
      <Header isPublicPage />
      <main>
        {breadcrumbs && (
          <nav aria-label="Breadcrumb" className="border-b border-ink/8 bg-white">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 px-4 py-2.5 text-xs font-semibold text-ink/50 sm:px-6 lg:px-8">
              <a href="/" className="hover:text-leaf transition">Inicio</a>
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  <ChevronRight size={12} />
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-leaf transition">{crumb.label}</a>
                  ) : (
                    <span className="text-ink/80">{crumb.label}</span>
                  )}
                </span>
              ))}
            </div>
          </nav>
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
}

// ─── Store list (shared between mall detail and outlet detail) ────────────────

function StoreList({ stores }) {
  if (!stores?.length) return null;
  const cats = ["anchor", "fashion", "sport", "tech", "food", "other"];
  const catLabels = { anchor: "Tiendas ancla", fashion: "Moda", sport: "Deporte", tech: "Tecnología", food: "Gastronomía", other: "Otros" };
  const catStyles = {
    anchor: "bg-ink text-white",
    food: "bg-gold/12 text-gold",
    tech: "bg-sky-50 text-sky-700",
    sport: "bg-leaf/10 text-leaf",
    fashion: "bg-ink/6 text-ink/65",
    other: "bg-ink/6 text-ink/65",
  };
  return (
    <div className="mt-6">
      <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-ink/40 mb-3">
        <ShoppingBag size={13} /> Tiendas destacadas
      </h3>
      <div className="grid gap-3">
        {cats.map((cat) => {
          const items = stores.filter((s) => s.cat === cat);
          if (!items.length) return null;
          return (
            <div key={cat}>
              <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-ink/30">{catLabels[cat]}</p>
              <div className="flex flex-wrap gap-1.5">
                {items.map((s) => (
                  <span key={s.name} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${catStyles[cat] || catStyles.other}`}>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mall/Outlet Detail Page ──────────────────────────────────────────────────

function MallDetailPage({ mall, isOutlet }) {
  const hubPath = isOutlet ? "/outlets/" : "/malls/";
  const hubLabel = isOutlet ? "Outlets" : "Malls";
  const canonicalPath = isOutlet ? `/outlets/${mall.id}/` : `/malls/${mall.id}/`;
  const canonical = `${SITE_URL}${canonicalPath}`;
  const mapsUrl = mallMapsUrl(mall);

  // Related routes
  const relatedRoutes = routes.filter((r) => r.stops.some((s) => s.mallId === mall.id));
  // Related guides
  const relatedGuides = guides.filter((g) => g.relatedMalls?.includes(mall.id));
  // Related comparisons
  const relatedComparisons = comparisons.filter((c) => c.mallIds?.includes(mall.id));

  useEffect(() => {
    const titleSuffix = isOutlet
      ? "Outlet · Horarios, tiendas y cómo llegar"
      : "Horarios, tiendas y cómo llegar";
    const title = `${mall.name} · ${titleSuffix} | Shopeando`;
    const description = mall.description;
    setPageSeo({ title, description, canonical, ogImage: mall.imageUrl ? `${SITE_URL}${mall.imageUrl}` : undefined });

    // JSON-LD
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "ShoppingCenter",
      "@id": `${canonical}#shoppingcenter`,
      name: mall.name,
      description: mall.description,
      url: canonical,
      address: {
        "@type": "PostalAddress",
        addressLocality: mall.commune,
        addressRegion: "Región Metropolitana",
        addressCountry: "CL",
      },
      hasMap: mapsUrl,
      isAccessibleForFree: true,
    };
    if (mall.lat && mall.lng) jsonLd.geo = { "@type": "GeoCoordinates", latitude: mall.lat, longitude: mall.lng };
    if (mall.imageUrl) jsonLd.image = `${SITE_URL}${mall.imageUrl}`;
    if (mall.officialUrl) jsonLd.sameAs = [mall.officialUrl];
    if (mall.stores?.length) jsonLd.containsPlace = mall.stores.slice(0, 20).map((s) => ({ "@type": "Store", name: s.name }));
    injectJsonLd("page-jsonld", jsonLd);
    return () => removeJsonLd("page-jsonld");
  }, [mall, isOutlet, canonical, mapsUrl]);

  return (
    <PageShell breadcrumbs={[{ label: hubLabel, href: hubPath }, { label: mall.name }]}>
      {/* Hero */}
      <div className="relative">
        {mall.imageUrl ? (
          <div className="relative h-52 w-full overflow-hidden sm:h-72">
            <img src={mall.imageUrl} alt={mall.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
          </div>
        ) : (
          <div className="relative h-40" style={{ background: "linear-gradient(135deg,#1f3144 0%,#12615b 70%,#e36b45 100%)" }} />
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="text-xs font-extrabold uppercase tracking-widest text-white/60">{mall.commune}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-white drop-shadow">{mall.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {isOutlet && (
              <span className="rounded-full bg-coral/80 px-3 py-1 text-xs font-extrabold text-white backdrop-blur-sm">Outlet</span>
            )}
            {mall.premium && (
              <span className="rounded-full bg-gold/80 px-3 py-1 text-xs font-extrabold text-white backdrop-blur-sm">Premium</span>
            )}
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-xs font-extrabold text-white backdrop-blur-sm">
              <Star size={10} fill="currentColor" /> {mall.touristScore}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          {/* Main column */}
          <div>
            <p className="text-sm leading-7 text-ink/68 mt-2">{mall.description}</p>

            {/* Info grid */}
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {mall.bestFor?.length > 0 && (
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-ink/40">Mejor para</h2>
                  <ul className="mt-2.5 grid gap-2">
                    {mall.bestFor.map((item) => (
                      <li key={item} className="flex gap-2.5 text-sm leading-6 text-ink/68">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {mall.notIdealFor?.length > 0 && (
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-ink/40">No ideal para</h2>
                  <ul className="mt-2.5 grid gap-2">
                    {mall.notIdealFor.map((item) => (
                      <li key={item} className="flex gap-2.5 text-sm leading-6 text-ink/68">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {mall.tips?.length > 0 && (
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-ink/40">Tips turistas</h2>
                  <ul className="mt-2.5 grid gap-2">
                    {mall.tips.map((item) => (
                      <li key={item} className="flex gap-2.5 text-sm leading-6 text-ink/68">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {mall.nearbyAttractions?.length > 0 && (
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-ink/40">Atracciones cercanas</h2>
                  <ul className="mt-2.5 grid gap-2">
                    {mall.nearbyAttractions.map((item) => (
                      <li key={item} className="flex gap-2.5 text-sm leading-6 text-ink/68">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <StoreList stores={mall.stores} />
            <ReviewSection mallId={mall.id} />

            {/* Related routes */}
            {relatedRoutes.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-ink/40 mb-3 flex items-center gap-2">
                  <Route size={13} /> Rutas que incluyen este {isOutlet ? "outlet" : "mall"}
                </h2>
                <div className="grid gap-3">
                  {relatedRoutes.map((route) => (
                    <a
                      key={route.id}
                      href={routePath(route)}
                      className="flex items-center justify-between gap-3 rounded-xl border border-ink/8 bg-white p-4 text-sm font-semibold transition hover:border-leaf/30 hover:text-leaf"
                    >
                      <span>{route.title}</span>
                      <ChevronRight size={14} className="shrink-0 text-ink/30" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Related guides */}
            {relatedGuides.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-ink/40 mb-3">Guías relacionadas</h2>
                <div className="grid gap-3">
                  {relatedGuides.map((guide) => (
                    <a
                      key={guide.id}
                      href={guidePath(guide)}
                      className="flex items-center justify-between gap-3 rounded-xl border border-ink/8 bg-white p-4 text-sm font-semibold transition hover:border-leaf/30 hover:text-leaf"
                    >
                      <span>{guide.title}</span>
                      <ChevronRight size={14} className="shrink-0 text-ink/30" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Related comparisons */}
            {relatedComparisons.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-ink/40 mb-3">Comparaciones</h2>
                <div className="grid gap-3">
                  {relatedComparisons.map((comp) => (
                    <a
                      key={comp.id}
                      href={comparisonPath(comp)}
                      className="flex items-center justify-between gap-3 rounded-xl border border-ink/8 bg-white p-4 text-sm font-semibold transition hover:border-leaf/30 hover:text-leaf"
                    >
                      <span>{comp.title}</span>
                      <ChevronRight size={14} className="shrink-0 text-ink/30" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            <div className="rounded-xl bg-mist p-5 sticky top-20">
              <div className="grid gap-3.5 text-sm font-semibold text-ink/70">
                <span className="flex items-start gap-3">
                  <TrainFront size={16} className="mt-0.5 shrink-0 text-leaf" />
                  {mall.transport?.metro}
                </span>
                <span className="flex items-center gap-3">
                  <Car size={16} className="shrink-0 text-leaf" />
                  Parking: {mall.transport?.parking ? "Sí" : "No"} · Uber: {mall.transport?.uber ? "Sí" : "No"}
                </span>
                <span className="flex items-center gap-3">
                  <Clock size={16} className="shrink-0 text-leaf" />
                  {mall.recommendedTime}
                </span>
                <span className="flex items-center gap-3">
                  <MapPin size={16} className="shrink-0 text-leaf" />
                  Precio: {mall.priceLevel}
                </span>
              </div>

              <div className="mt-4 grid gap-2.5">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-button justify-center bg-leaf hover:bg-leaf/85"
                >
                  <ExternalLink size={15} /> Ver en Google Maps
                </a>
                {mall.officialUrl && (
                  <a
                    href={mall.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-xl border border-leaf/25 bg-leaf/6 px-4 py-3 transition hover:bg-leaf/12 hover:border-leaf/40"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-leaf text-white">
                        <ExternalLink size={13} />
                      </span>
                      <div>
                        <p className="text-xs font-extrabold text-leaf">Sitio oficial</p>
                        <p className="text-[10px] text-ink/40 font-medium truncate max-w-[140px]">{mall.officialUrl.replace("https://", "")}</p>
                      </div>
                    </div>
                    <ExternalLink size={13} className="shrink-0 text-leaf/50" />
                  </a>
                )}
              </div>

              <p className="mt-4 rounded-xl border border-ink/8 bg-[#f8faf6] p-3.5 text-xs font-medium leading-5 text-ink/45">
                Confirma horarios oficiales antes de ir.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Malls Hub ────────────────────────────────────────────────────────────────

function MallsHub() {
  const canonical = `${SITE_URL}/malls/`;
  useEffect(() => {
    setPageSeo({
      title: "Malls en Santiago de Chile · Guía completa | Shopeando",
      description: "Todos los centros comerciales de Santiago de Chile: Costanera Center, Parque Arauco, Alto Las Condes y más. Horarios, tiendas y cómo llegar.",
      canonical,
    });
    removeJsonLd("page-jsonld");
  }, []);

  return (
    <PageShell breadcrumbs={[{ label: "Malls" }]}>
      <div className="section-shell">
        <div className="mb-8">
          <p className="eyebrow">Centros comerciales</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold">Malls en Santiago</h1>
          <p className="mt-3 text-sm leading-6 text-ink/55 max-w-2xl">
            Guía completa de los centros comerciales de Santiago de Chile. Encuentra el mall ideal según tu zona, presupuesto y tipo de compra.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mallPages.map((mall) => (
            <MallListCard key={mall.id} mall={mall} href={mallPath(mall)} />
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-4 border-t border-ink/8 pt-6">
          <a href="/outlets/" className="secondary-button">Ver outlets →</a>
          <a href="/rutas/" className="secondary-button">Ver rutas →</a>
          <a href="/guias/" className="secondary-button">Ver guías →</a>
          <a href="/comparar/" className="secondary-button">Comparar malls →</a>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Outlets Hub ─────────────────────────────────────────────────────────────

function OutletsHub() {
  const canonical = `${SITE_URL}/outlets/`;
  useEffect(() => {
    setPageSeo({
      title: "Outlets en Santiago de Chile · Descuentos y marcas | Shopeando",
      description: "Los mejores outlets de Santiago: Easton Outlet Mall y Arauco Premium Outlet Buenaventura. Marcas, descuentos, horarios y cómo llegar.",
      canonical,
    });
    removeJsonLd("page-jsonld");
  }, []);

  return (
    <PageShell breadcrumbs={[{ label: "Outlets" }]}>
      <div className="section-shell">
        <div className="mb-8">
          <p className="eyebrow">Descuentos</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold">Outlets en Santiago</h1>
          <p className="mt-3 text-sm leading-6 text-ink/55 max-w-2xl">
            Los outlets de Santiago ofrecen descuentos de hasta un 70% en marcas de moda, deporte y accesorios. Planifica tu visita con esta guía.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {outletPages.map((mall) => (
            <MallListCard key={mall.id} mall={mall} href={mallPath(mall)} badge="Outlet" />
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-4 border-t border-ink/8 pt-6">
          <a href="/malls/" className="secondary-button">Ver malls →</a>
          <a href="/guias/outlets-en-santiago/" className="secondary-button">Guía de outlets →</a>
          <a href="/comparar/easton-vs-arauco-premium-outlet/" className="secondary-button">Comparar outlets →</a>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Shared mall list card ────────────────────────────────────────────────────

function MallListCard({ mall, href, badge }) {
  const mapsUrl = mallMapsUrl(mall);
  return (
    <article className="group overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-soft">
      <a href={href} className="relative block h-40 w-full overflow-hidden bg-ink/8">
        {mall.imageUrl ? (
          <img
            src={mall.imageUrl}
            alt={mall.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-night/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-white/70">{mall.commune}</p>
            <h2 className="mt-0.5 font-display text-lg font-extrabold leading-tight text-white drop-shadow">{mall.name}</h2>
          </div>
          {badge && (
            <span className="rounded-full bg-coral/80 px-2 py-1 text-xs font-extrabold text-white">{badge}</span>
          )}
        </div>
      </a>
      <div className="border-b border-ink/6 bg-white px-4 py-2.5">
        <ReviewSummary mallId={mall.id} />
      </div>
      <div className="p-4">
        <p className="text-sm leading-relaxed text-ink/55 line-clamp-2">{mall.description}</p>
        <div className="mt-3 flex items-center gap-2 border-t border-ink/6 pt-3">
          <a href={href} className="primary-button flex-1 py-2 text-xs justify-center">
            Ver ficha
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink/50 transition hover:border-leaf/40 hover:text-leaf"
            aria-label="Ver en Google Maps"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </article>
  );
}

// ─── Rutas Hub ────────────────────────────────────────────────────────────────

function RutasHub() {
  const canonical = `${SITE_URL}/rutas/`;
  useEffect(() => {
    setPageSeo({
      title: "Rutas de compras en Santiago · Itinerarios para turistas | Shopeando",
      description: "Rutas de compras recomendadas en Santiago de Chile: primera visita, outlet day, compras premium, familia con niños y más. Con paradas y mapa.",
      canonical,
    });
    removeJsonLd("page-jsonld");
  }, []);

  return (
    <PageShell breadcrumbs={[{ label: "Rutas" }]}>
      <div className="section-shell">
        <div className="mb-8">
          <p className="eyebrow">Itinerarios</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold">Rutas de compras en Santiago</h1>
          <p className="mt-3 text-sm leading-6 text-ink/55 max-w-2xl">
            Itinerarios curados para turistas: compras, traslados y experiencia en una sola decisión.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => (
            <RouteListCard key={route.id} route={route} href={routePath(route)} />
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-4 border-t border-ink/8 pt-6">
          <a href="/malls/" className="secondary-button">Ver malls →</a>
          <a href="/guias/" className="secondary-button">Ver guías →</a>
        </div>
      </div>
    </PageShell>
  );
}

function RouteListCard({ route, href }) {
  const stopMalls = route.stops.map((s) => mallMap[s.mallId]).filter(Boolean);
  const mapsUrl = routeMapsUrl(route.stops, mallMap);
  return (
    <article className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-card">
      <div className="h-1.5 bg-gradient-to-r from-leaf to-night" />
      <div className="p-5">
        <p className="text-xs font-extrabold text-coral">{route.duration} · {route.stops.length} {route.stops.length === 1 ? "parada" : "paradas"}</p>
        <h2 className="mt-1.5 font-display text-lg font-extrabold">{route.title}</h2>
        <p className="mt-2 text-sm text-ink/55 line-clamp-2">{route.summary}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {route.bestFor.map((tag) => <span key={tag} className="tag">{tag}</span>)}
        </div>
        {stopMalls.length > 0 && (
          <ul className="mt-3 grid gap-1.5">
            {stopMalls.map((mall) => (
              <li key={mall.id} className="flex items-center gap-2 text-xs font-semibold text-ink/60">
                <span className="h-1.5 w-1.5 rounded-full bg-leaf shrink-0" />
                <a href={mallPath(mall)} className="hover:text-leaf transition">
                  {mall.name}
                </a>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex gap-2 border-t border-ink/6 pt-3">
          <a href={href} className="primary-button flex-1 py-2 text-xs justify-center">Ver ruta</a>
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink/50 transition hover:border-leaf/40 hover:text-leaf"
              aria-label="Ver en Google Maps"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Ruta Detail Page ─────────────────────────────────────────────────────────

function RutaDetailPage({ route }) {
  const canonical = `${SITE_URL}/rutas/${route.id}/`;
  const mapsUrl = routeMapsUrl(route.stops, mallMap);
  const stopMalls = route.stops.map((s) => ({ ...s, mall: mallMap[s.mallId] }));

  useEffect(() => {
    setPageSeo({
      title: `${route.title} · Ruta de compras en Santiago | Shopeando`,
      description: route.summary,
      canonical,
    });
    removeJsonLd("page-jsonld");
  }, [route, canonical]);

  return (
    <PageShell breadcrumbs={[{ label: "Rutas", href: "/rutas/" }, { label: route.title }]}>
      <div className="section-shell">
        <div className="mb-8 max-w-2xl">
          <p className="eyebrow">Ruta de compras</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold">{route.title}</h1>
          <p className="mt-3 text-sm leading-6 text-ink/55">{route.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="tag text-coral font-extrabold">{route.duration}</span>
            <span className="tag">{route.stops.length} {route.stops.length === 1 ? "parada" : "paradas"}</span>
            {route.bestFor.map((tag) => <span key={tag} className="tag">{tag}</span>)}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            {/* Stops */}
            <div className="grid gap-0">
              {stopMalls.map(({ mall, note }, i) => {
                const isLast = i === stopMalls.length - 1;
                const mallHref = mall ? mallPath(mall) : null;
                const stopMapsUrl = mall ? mallMapsUrl(mall) : null;
                return (
                  <div key={i} className="grid grid-cols-[32px_1fr] gap-3">
                    <div className="flex flex-col items-center">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-extrabold text-white">
                        {i + 1}
                      </span>
                      {!isLast && <span className="my-1 w-px flex-1 bg-ink/10" />}
                    </div>
                    <div className={`rounded-xl bg-[#f8faf6] p-4 ${isLast ? "" : "mb-3"}`}>
                      {mall && (
                        <p className="text-xs font-extrabold uppercase tracking-wider text-ink/35">{mall.commune}</p>
                      )}
                      <p className="mt-1 font-extrabold text-sm">
                        {mallHref ? (
                          <a href={mallHref} className="hover:text-leaf transition">{mall?.name || note}</a>
                        ) : (
                          note
                        )}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-ink/50">{note}</p>
                      {stopMapsUrl && (
                        <a
                          href={stopMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-leaf hover:underline"
                        >
                          <MapPin size={11} /> Ver en Maps
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tips */}
            {route.tips?.length > 0 && (
              <div className="mt-6 rounded-xl bg-mist px-4 py-3">
                <ul className="grid gap-1 text-xs leading-5 text-ink/55">
                  {route.tips.map((tip) => (
                    <li key={tip} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf/50" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Full route Maps */}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-leaf/25 bg-leaf/8 px-4 py-3 text-sm font-extrabold text-leaf transition hover:bg-leaf/15"
              >
                <ExternalLink size={15} />
                {route.stops.length > 1 ? "Abrir ruta en Google Maps" : "Ver en Google Maps"}
              </a>
            )}
          </div>

          {/* Sidebar: mall links */}
          <aside>
            <div className="rounded-xl bg-mist p-5 sticky top-20">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-ink/40 mb-4">Paradas de la ruta</h2>
              <ul className="grid gap-2">
                {stopMalls.map(({ mall }, i) => {
                  if (!mall) return null;
                  const href = mallPath(mall);
                  return (
                    <li key={mall.id}>
                      <a
                        href={href}
                        className="flex items-center gap-3 rounded-xl bg-white p-3 text-sm font-semibold transition hover:text-leaf border border-ink/6 hover:border-leaf/20"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-white text-xs font-extrabold">{i + 1}</span>
                        <span className="flex-1">{mall.name}</span>
                        <ChevronRight size={13} className="text-ink/30 shrink-0" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Guías Hub ────────────────────────────────────────────────────────────────

function GuiasHub() {
  const canonical = `${SITE_URL}/guias/`;
  useEffect(() => {
    setPageSeo({
      title: "Guías de compras en Santiago · Editorial | Shopeando",
      description: "Guías editoriales para comprar en Santiago de Chile: dónde ir, qué encontrar y cómo moverte entre malls, outlets y zonas comerciales.",
      canonical,
    });
    removeJsonLd("page-jsonld");
  }, []);

  return (
    <PageShell breadcrumbs={[{ label: "Guías" }]}>
      <div className="section-shell">
        <div className="mb-8">
          <p className="eyebrow">Editorial</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold">Guías de compras</h1>
          <p className="mt-3 text-sm leading-6 text-ink/55 max-w-2xl">
            Artículos y guías para planificar tus compras en Santiago de Chile.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {guides.map((guide) => (
            <GuideListCard key={guide.id} guide={guide} />
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-4 border-t border-ink/8 pt-6">
          <a href="/malls/" className="secondary-button">Ver malls →</a>
          <a href="/comparar/" className="secondary-button">Ver comparaciones →</a>
        </div>
      </div>
    </PageShell>
  );
}

function GuideListCard({ guide }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-card">
      {guide.imageUrl && (
        <a href={guidePath(guide)} className="block h-44 w-full overflow-hidden bg-ink/8">
          <img
            src={guide.imageUrl}
            alt={guide.title}
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
            loading="lazy"
          />
        </a>
      )}
      <div className="p-5">
        <a href={guidePath(guide)} className="block hover:text-leaf transition">
          <h2 className="font-display text-lg font-extrabold leading-tight">{guide.title}</h2>
        </a>
        <p className="mt-2 text-sm text-ink/55 line-clamp-2">{guide.description}</p>
        <div className="mt-4 border-t border-ink/6 pt-3">
          <a href={guidePath(guide)} className="primary-button py-2 text-xs w-full justify-center">
            Leer guía
          </a>
        </div>
      </div>
    </article>
  );
}

// ─── Guía Detail Page ─────────────────────────────────────────────────────────

function GuiaDetailPage({ guide }) {
  const canonical = `${SITE_URL}/guias/${guide.id}/`;
  const relatedMallObjs = (guide.relatedMalls || []).map((id) => mallMap[id]).filter(Boolean);

  useEffect(() => {
    setPageSeo({
      title: `${guide.title} | Shopeando`,
      description: guide.description,
      canonical,
      ogImage: guide.imageUrl ? `${SITE_URL}${guide.imageUrl}` : undefined,
    });

    // Article JSON-LD
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.title,
      description: guide.description,
      datePublished: guide.publishedAt,
      dateModified: guide.modifiedAt,
      url: canonical,
      publisher: { "@type": "Organization", name: "Shopeando", url: SITE_URL },
    };
    if (guide.imageUrl) jsonLd.image = `${SITE_URL}${guide.imageUrl}`;
    injectJsonLd("page-jsonld", jsonLd);
    return () => removeJsonLd("page-jsonld");
  }, [guide, canonical]);

  return (
    <PageShell breadcrumbs={[{ label: "Guías", href: "/guias/" }, { label: guide.title }]}>
      {guide.imageUrl && (
        <div className="h-52 w-full overflow-hidden sm:h-72">
          <img src={guide.imageUrl} alt={guide.title} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <article>
            <header className="mb-8">
              <p className="eyebrow">Guía editorial</p>
              <h1 className="mt-3 font-display text-4xl font-extrabold">{guide.title}</h1>
              <p className="mt-3 text-sm leading-6 text-ink/55">{guide.description}</p>
            </header>

            {guide.sections?.map((section) => (
              <section key={section.heading} className="mb-6">
                <h2 className="font-display text-xl font-extrabold mb-3">{section.heading}</h2>
                <p className="text-sm leading-7 text-ink/68">{section.body}</p>
              </section>
            ))}
          </article>

          {/* Sidebar */}
          {relatedMallObjs.length > 0 && (
            <aside>
              <div className="rounded-xl bg-mist p-5 sticky top-20">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-ink/40 mb-4">Malls mencionados</h2>
                <ul className="grid gap-2">
                  {relatedMallObjs.map((mall) => {
                    const href = mallPath(mall);
                    return (
                      <li key={mall.id}>
                        <a
                          href={href}
                          className="flex items-center gap-3 rounded-xl bg-white p-3 text-sm font-semibold transition hover:text-leaf border border-ink/6 hover:border-leaf/20"
                        >
                          <span className="flex-1">{mall.name}</span>
                          <ChevronRight size={13} className="text-ink/30 shrink-0" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>
          )}
        </div>
      </div>
    </PageShell>
  );
}

// ─── Comparar Hub ─────────────────────────────────────────────────────────────

function CompararHub() {
  const canonical = `${SITE_URL}/comparar/`;
  useEffect(() => {
    setPageSeo({
      title: "Comparaciones de malls y outlets en Santiago | Shopeando",
      description: "Compara los malls y outlets de Santiago de Chile: Parque Arauco vs Costanera Center, Easton vs Arauco Premium Outlet y más comparaciones curadas.",
      canonical,
    });
    removeJsonLd("page-jsonld");
  }, []);

  return (
    <PageShell breadcrumbs={[{ label: "Comparar" }]}>
      <div className="section-shell">
        <div className="mb-8">
          <p className="eyebrow">Decisión rápida</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold">Comparaciones</h1>
          <p className="mt-3 text-sm leading-6 text-ink/55 max-w-2xl">
            Comparaciones curadas para ayudarte a elegir entre los malls y outlets de Santiago.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {comparisons.map((comp) => (
            <ComparisonListCard key={comp.id} comparison={comp} />
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-4 border-t border-ink/8 pt-6">
          <a href="/malls/" className="secondary-button">Ver malls →</a>
          <a href="/outlets/" className="secondary-button">Ver outlets →</a>
        </div>
      </div>
    </PageShell>
  );
}

function ComparisonListCard({ comparison }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-card">
      {comparison.imageUrl && (
        <a href={comparisonPath(comparison)} className="block h-40 w-full overflow-hidden bg-ink/8">
          <img
            src={comparison.imageUrl}
            alt={comparison.title}
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
            loading="lazy"
          />
        </a>
      )}
      <div className="p-5">
        <a href={comparisonPath(comparison)} className="block hover:text-leaf transition">
          <h2 className="font-display text-lg font-extrabold leading-tight">{comparison.title}</h2>
        </a>
        <p className="mt-2 text-sm text-ink/55 line-clamp-2">{comparison.description}</p>
        <div className="mt-4 border-t border-ink/6 pt-3">
          <a href={comparisonPath(comparison)} className="primary-button py-2 text-xs w-full justify-center">
            Ver comparación
          </a>
        </div>
      </div>
    </article>
  );
}

// ─── Comparar Detail Page ─────────────────────────────────────────────────────

function CompararDetailPage({ comparison }) {
  const canonical = `${SITE_URL}/comparar/${comparison.id}/`;
  const [mallA, mallB] = comparison.mallIds.map((id) => mallMap[id]);

  useEffect(() => {
    setPageSeo({
      title: `${comparison.title} | Shopeando`,
      description: comparison.description,
      canonical,
      ogImage: comparison.imageUrl ? `${SITE_URL}${comparison.imageUrl}` : undefined,
    });
    removeJsonLd("page-jsonld");
  }, [comparison, canonical]);

  function mallHref(mall) {
    if (!mall) return "#";
    return mallPath(mall);
  }

  return (
    <PageShell breadcrumbs={[{ label: "Comparar", href: "/comparar/" }, { label: comparison.title }]}>
      {comparison.imageUrl && (
        <div className="h-44 w-full overflow-hidden sm:h-56">
          <img src={comparison.imageUrl} alt={comparison.title} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="section-shell">
        <div className="mb-8 max-w-3xl">
          <p className="eyebrow">Comparación</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold">{comparison.title}</h1>
          <p className="mt-3 text-sm leading-6 text-ink/55">{comparison.intro}</p>
        </div>

        {/* Mall links */}
        {(mallA || mallB) && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            {[mallA, mallB].map((mall, i) => {
              if (!mall) return null;
              const href = mallHref(mall);
              const mapsUrl = mallMapsUrl(mall);
              return (
                <div key={mall.id} className="rounded-xl border border-ink/8 bg-white p-4 flex flex-col gap-3">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink/35 mb-1">{i === 0 ? "Mall A" : "Mall B"}</p>
                    <a href={href} className="font-display text-lg font-extrabold hover:text-leaf transition">{mall.name}</a>
                    <p className="text-xs text-ink/50 mt-0.5">{mall.commune}</p>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <a href={href} className="primary-button flex-1 py-2 text-xs justify-center">Ver ficha</a>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink/50 transition hover:border-leaf/40 hover:text-leaf"
                      aria-label={`Ver ${mall.name} en Maps`}
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Criteria */}
        {comparison.criteria?.length > 0 && (
          <div className="grid gap-6 mb-8">
            {comparison.criteria.map((criterion) => (
              <div key={criterion.name} className="rounded-xl border border-ink/8 bg-white overflow-hidden">
                <div className="bg-mist px-5 py-3">
                  <h2 className="font-extrabold text-sm">{criterion.name}</h2>
                </div>
                <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-ink/8">
                  <div className="p-5">
                    {mallA && (
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink/35 mb-2">
                        <a href={mallHref(mallA)} className="hover:text-leaf transition">{mallA.name}</a>
                      </p>
                    )}
                    <p className="text-sm leading-6 text-ink/68">{criterion.mallA}</p>
                  </div>
                  <div className="p-5">
                    {mallB && (
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink/35 mb-2">
                        <a href={mallHref(mallB)} className="hover:text-leaf transition">{mallB.name}</a>
                      </p>
                    )}
                    <p className="text-sm leading-6 text-ink/68">{criterion.mallB}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Conclusion */}
        {comparison.conclusion && (
          <div className="rounded-xl bg-leaf/8 border border-leaf/20 p-6 mb-8">
            <h2 className="font-extrabold text-sm uppercase tracking-wider text-leaf mb-3">Conclusión</h2>
            <p className="text-sm leading-6 text-ink/70">{comparison.conclusion}</p>
          </div>
        )}

        {/* Related guides */}
        <div className="mt-6 flex flex-wrap gap-4 border-t border-ink/8 pt-6">
          <a href="/comparar/" className="secondary-button">Ver todas las comparaciones →</a>
          <a href="/guias/" className="secondary-button">Ver guías →</a>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Legacy redirect page ─────────────────────────────────────────────────────

function LegacyMallRedirect({ mall }) {
  const canonical = mall.outlet ? `/outlets/${mall.id}/` : `/malls/${mall.id}/`;
  useEffect(() => {
    // Set noindex for legacy URLs, then redirect
    const robots = document.head.querySelector('meta[name="robots"]');
    if (robots) robots.setAttribute("content", "noindex,follow");
    // Redirect to canonical
    window.history.replaceState({}, "", canonical);
  }, [canonical]);

  // Show the correct page immediately
  return <MallDetailPage mall={mall} isOutlet={mall.outlet} />;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function PublicSeoPage({ match }) {
  const { type } = match;

  if (type === "hub") {
    const { hub } = match;
    if (hub === "malls") return <MallsHub />;
    if (hub === "outlets") return <OutletsHub />;
    if (hub === "rutas") return <RutasHub />;
    if (hub === "guias") return <GuiasHub />;
    if (hub === "comparar") return <CompararHub />;
  }

  if (type === "mall-detail") return <MallDetailPage mall={match.mall} isOutlet={match.isOutlet} />;
  if (type === "ruta-detail") return <RutaDetailPage route={match.route} />;
  if (type === "guia-detail") return <GuiaDetailPage guide={match.guide} />;
  if (type === "comparar-detail") return <CompararDetailPage comparison={match.comparison} />;
  if (type === "legacy-mall") return <LegacyMallRedirect mall={match.mall} />;

  return null;
}
