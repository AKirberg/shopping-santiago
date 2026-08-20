import { useEffect, useMemo, useRef, useState } from "react";
import malls from "./data/malls.json";
import routes from "./data/routes.json";
import { matchesMallFilters } from "./utils/scoring";
import { computeTimeBreakdown } from "./utils/timeCalc";
import { applyMallSeo, resetSeo } from "./utils/mallSeo";
import { useLanguage } from "./i18n/LanguageContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import LocationBar from "./components/LocationBar";
import QuickIntentButtons from "./components/QuickIntentButtons";
import MallGrid from "./components/MallGrid";
import MallFilters from "./components/MallFilters";
import RecommendationQuiz from "./components/RecommendationQuiz";
import LastMinutePanel from "./components/LastMinutePanel";
import RoutesSection from "./components/RoutesSection";
import CompareMalls from "./components/CompareMalls";
import TouristTips from "./components/TouristTips";
import MallDetail from "./components/MallDetail";
import GalleriesSection from "./components/GalleriesSection";
import Footer from "./components/Footer";
import PublicSeoPage, { matchPublicRoute } from "./components/PublicSeoPage";

// Legacy /mall/:id path parser (for home modal only — actual routing handled by matchPublicRoute)
function mallFromLegacyPath(pathname) {
  const match = pathname.match(/^\/mall\/([^/]+)\/?$/);
  return match ? malls.find(m => m.id === match[1]) ?? null : null;
}

const defaultFilters = {
  query: "", commune: "Todas", category: "Todas",
  outlet: false, premium: false, family: false,
  metro: false, food: false, gastronomico: false, quick: false, tourist: false,
};
const LOCATION_STATE_KEY = "ss-location-state";

function loadSavedLocation() {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCATION_STATE_KEY) || "null");
    if (
      !saved ||
      typeof saved.address !== "string" ||
      !Number.isFinite(saved.coords?.lat) ||
      !Number.isFinite(saved.coords?.lng)
    ) return { address: "", coords: null };
    return { address: saved.address, coords: saved.coords };
  } catch {
    return { address: "", coords: null };
  }
}

function App() {
  const { t, lang } = useLanguage();

  // Determine if current path is a public SEO page
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const publicMatch = useMemo(() => matchPublicRoute(currentPath), [currentPath]);

  const [filters, setFilters] = useState(defaultFilters);
  const [selectedMall, setSelectedMall] = useState(() => {
    // Only open modal for legacy paths when NOT handled as public SEO page
    if (!matchPublicRoute(window.location.pathname)) {
      return mallFromLegacyPath(window.location.pathname);
    }
    return null;
  });
  const [compareIds, setCompareIds] = useState(["costanera-center", "parque-arauco"]);
  const [flightTime, setFlightTime] = useState("");
  const [minutesToAirport, setMinutesToAirport] = useState(45);
  const [flightType, setFlightType] = useState("international");
  const [userAddress, setUserAddress] = useState(() => loadSavedLocation().address);
  const [userCoords, setUserCoords] = useState(() => loadSavedLocation().coords);
  const [lastMinuteOpen, setLastMinuteOpen] = useState(false);
  const [triggerAddressOpen, setTriggerAddressOpen] = useState(false);
  const returnToLastMinute = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname);
      // Only update selectedMall for home/legacy paths
      if (!matchPublicRoute(window.location.pathname)) {
        setSelectedMall(mallFromLegacyPath(window.location.pathname));
      } else {
        setSelectedMall(null);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!publicMatch) {
      if (selectedMall) applyMallSeo(selectedMall, lang);
      else resetSeo(lang);
    }
  }, [selectedMall, lang, publicMatch]);

  /* Reopen LastMinutePanel after user sets address from within it */
  useEffect(() => {
    if (userAddress && returnToLastMinute.current) {
      returnToLastMinute.current = false;
      setLastMinuteOpen(true);
    }
  }, [userAddress]);

  useEffect(() => {
    try {
      if (userAddress && userCoords) {
        localStorage.setItem(LOCATION_STATE_KEY, JSON.stringify({ address: userAddress, coords: userCoords }));
      } else {
        localStorage.removeItem(LOCATION_STATE_KEY);
      }
    } catch { /* Storage can be unavailable in private browsing. */ }
  }, [userAddress, userCoords]);

  function openMall(mall) {
    const canonicalPath = mall.outlet ? `/outlets/${mall.id}/` : `/malls/${mall.id}/`;
    if (window.location.pathname !== canonicalPath) {
      window.history.pushState({}, "", canonicalPath);
    }
    setSelectedMall(null);
    setCurrentPath(canonicalPath);
  }

  function closeMall() {
    setSelectedMall(null);
    if (window.location.pathname.startsWith("/mall/") || window.location.pathname.startsWith("/malls/") || window.location.pathname.startsWith("/outlets/")) {
      window.history.pushState({}, "", "/");
      setCurrentPath("/");
    }
  }

  const timeBreakdown = useMemo(
    () => computeTimeBreakdown(
      flightTime, minutesToAirport, 20,
      flightType === "domestic" ? 120 : 240
    ),
    [flightTime, minutesToAirport, flightType]
  );
  const availableHours = timeBreakdown?.availableHours ?? null;
  const filteredMalls = useMemo(() => malls.filter(mall => matchesMallFilters(mall, filters)), [filters]);
  const featuredMalls = useMemo(
    () => malls.filter(mall => mall.touristScore >= 8 || mall.premium || mall.outlet).slice(0, 3),
    []
  );

  function applyIntent(intent) {
    const next = { ...defaultFilters };
    if (intent === "ropa") next.category = "ropa";
    if (intent === "outlet") next.outlet = true;
    if (intent === "kids") next.family = true;
    if (intent === "premium") next.premium = true;
    if (intent === "quick") next.quick = true;
    if (intent === "comer") next.food = true;
    setFilters(next);
    document.getElementById("malls")?.scrollIntoView({ behavior: "smooth" });
  }

  function toggleCompare(id) {
    setCompareIds(current =>
      current.includes(id) ? current.filter(i => i !== id) : [...current, id].slice(-3)
    );
  }

  function showRelatedRoute(mallId) {
    const route = routes.find(r => r.stops.some(s => s.mallId === mallId));
    if (route) {
      closeMall();
      setTimeout(() => document.getElementById(`route-${route.id}`)?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  const app = t.app;

  // ── Render public SEO pages ────────────────────────────────────────────────
  if (publicMatch) {
    return <PublicSeoPage match={publicMatch} />;
  }

  // ── Render home ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8faf6] text-ink">
      <Header />
      <main>
        <Hero onIntent={applyIntent} mallCount={malls.length} routeCount={routes.length} />
        <LocationBar
          forceOpen={triggerAddressOpen}
          onForceOpenHandled={() => setTriggerAddressOpen(false)}
          address={userAddress}
          setAddress={setUserAddress}
          userCoords={userCoords}
          setUserCoords={setUserCoords}
          malls={malls}
          flightTime={flightTime}
          availableHours={availableHours}
          timeBreakdown={timeBreakdown}
          onOpenFlight={() => setLastMinuteOpen(true)}
        />
        <QuickIntentButtons onIntent={applyIntent} onLastMinute={() => setLastMinuteOpen(true)} />

        <section className="bg-mist/70" id="destacados">
          <div className="section-shell">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">{app.featuredEyebrow}</p>
                <h2 className="mt-3 font-display text-4xl font-extrabold">{app.featuredTitle}</h2>
              </div>
              <a href="#malls" className="secondary-button">{app.featuredCta}</a>
            </div>
            <MallGrid
              malls={featuredMalls}
              compareIds={compareIds}
              onCompare={toggleCompare}
              onSelect={openMall}
              availableHours={availableHours}
            />
          </div>
        </section>

        <RecommendationQuiz
          malls={malls}
          onSelect={openMall}
          userCoords={userCoords}
          address={userAddress}
          onRequestLocation={() => setTriggerAddressOpen(true)}
        />
        <RoutesSection routes={routes} malls={malls} />

        <section id="malls" className="section-shell">
          <div className="mb-8 grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="eyebrow">{app.allEyebrow}</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold">{app.allTitle}</h2>
            </div>
            <MallFilters filters={filters} setFilters={setFilters} malls={malls} />
          </div>
          <MallGrid
            malls={filteredMalls}
            compareIds={compareIds}
            onCompare={toggleCompare}
            onSelect={openMall}
            availableHours={availableHours}
          />
        </section>

        <CompareMalls malls={malls} selectedIds={compareIds} setSelectedIds={setCompareIds} />
        <GalleriesSection />
        <TouristTips />
      </main>
      <Footer />
      {/* ── Modal Último minuto ── */}
      {lastMinuteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 pb-[22vh]"
          onClick={e => { if (e.target === e.currentTarget) setLastMinuteOpen(false); }}
        >
          <div className="relative w-full max-w-xl rounded-3xl bg-[#f8faf6] shadow-2xl overflow-hidden">
            <button
              onClick={() => setLastMinuteOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-ink/8 text-ink/50 transition hover:bg-ink/15 hover:text-ink"
              aria-label="Cerrar"
            >
              <span className="text-base leading-none">×</span>
            </button>
            <div className="p-4 pt-5">
              <LastMinutePanel
                flightTime={flightTime}
                setFlightTime={setFlightTime}
                timeBreakdown={timeBreakdown}
                minutesToAirport={minutesToAirport}
                setMinutesToAirport={setMinutesToAirport}
                flightType={flightType}
                setFlightType={setFlightType}
                malls={malls}
                onSelectMall={mall => { setLastMinuteOpen(false); openMall(mall); }}
                onClose={() => setLastMinuteOpen(false)}
                autoOpen
                address={userAddress}
                onOpenAddress={() => { setLastMinuteOpen(false); returnToLastMinute.current = true; setTriggerAddressOpen(true); }}
              />
            </div>
          </div>
        </div>
      )}

      {selectedMall && (
        <MallDetail
          mall={selectedMall}
          routes={routes}
          isComparing={compareIds.includes(selectedMall.id)}
          onCompare={() => toggleCompare(selectedMall.id)}
          onClose={closeMall}
          onRelatedRoute={() => showRelatedRoute(selectedMall.id)}
        />
      )}
    </div>
  );
}

export default App;
