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

function mallFromPath(pathname) {
  const match = pathname.match(/^\/mall\/([^/]+)\/?$/);
  return match ? malls.find(m => m.id === match[1]) ?? null : null;
}

const defaultFilters = {
  query: "", commune: "Todas", category: "Todas",
  outlet: false, premium: false, family: false,
  metro: false, food: false, gastronomico: false, quick: false, tourist: false,
};

function App() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedMall, setSelectedMall] = useState(() => mallFromPath(window.location.pathname));
  const [compareIds, setCompareIds] = useState(["costanera-center", "parque-arauco"]);
  const [flightTime, setFlightTime] = useState("");
  const [minutesToAirport, setMinutesToAirport] = useState(45);
  const [flightType, setFlightType] = useState("international");
  const [userAddress, setUserAddress] = useState("");
  const [userCoords, setUserCoords] = useState(null);
  const [lastMinuteOpen, setLastMinuteOpen] = useState(false);
  const [triggerAddressOpen, setTriggerAddressOpen] = useState(false);
  const returnToLastMinute = useRef(false);

  useEffect(() => {
    const onPopState = () => setSelectedMall(mallFromPath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (selectedMall) applyMallSeo(selectedMall);
    else resetSeo();
  }, [selectedMall]);

  /* Reopen LastMinutePanel after user sets address from within it */
  useEffect(() => {
    if (userAddress && returnToLastMinute.current) {
      returnToLastMinute.current = false;
      setLastMinuteOpen(true);
    }
  }, [userAddress]);

  function openMall(mall) {
    setSelectedMall(mall);
    if (window.location.pathname !== `/mall/${mall.id}`) {
      window.history.pushState({}, "", `/mall/${mall.id}`);
    }
  }

  function closeMall() {
    setSelectedMall(null);
    if (window.location.pathname.startsWith("/mall/")) {
      window.history.pushState({}, "", "/");
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

        <RecommendationQuiz malls={malls} onSelect={openMall} userCoords={userCoords} />
        <RoutesSection routes={routes} malls={malls} />
        <GalleriesSection />

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
        <TouristTips />
      </main>
      <Footer />
      {/* ── Modal Último minuto ── */}
      {lastMinuteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-sm p-0 sm:p-4"
          onClick={e => { if (e.target === e.currentTarget) setLastMinuteOpen(false); }}
        >
          <div className="relative w-full sm:max-w-xl sm:rounded-3xl rounded-t-3xl bg-[#f8faf6] shadow-2xl overflow-hidden">
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
