import { useMemo, useState } from "react";
import malls from "./data/malls.json";
import routes from "./data/routes.json";
import galleries from "./data/galleries.json";
import { matchesMallFilters } from "./utils/scoring";
import Header from "./components/Header";
import Hero from "./components/Hero";
import QuickIntentButtons from "./components/QuickIntentButtons";
import MallGrid from "./components/MallGrid";
import MallFilters from "./components/MallFilters";
import RecommendationQuiz from "./components/RecommendationQuiz";
import RoutesSection from "./components/RoutesSection";
import GalleriesSpecial from "./components/GalleriesSpecial";
import CompareMalls from "./components/CompareMalls";
import TouristTips from "./components/TouristTips";
import MallDetail from "./components/MallDetail";
import Footer from "./components/Footer";

const defaultFilters = {
  query: "",
  commune: "Todas",
  category: "Todas",
  outlet: false,
  premium: false,
  family: false,
  metro: false,
  food: false,
  quick: false,
  tourist: false
};

function App() {
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedMall, setSelectedMall] = useState(null);
  const [compareIds, setCompareIds] = useState(["costanera-center", "parque-arauco"]);

  const filteredMalls = useMemo(
    () => malls.filter((mall) => matchesMallFilters(mall, filters)),
    [filters]
  );

  const featuredMalls = useMemo(
    () => malls.filter((mall) => mall.touristScore >= 8 || mall.premium || mall.outlet).slice(0, 6),
    []
  );

  function applyIntent(intent) {
    const next = { ...defaultFilters };
    if (intent === "ropa") next.category = "ropa";
    if (intent === "outlet") next.outlet = true;
    if (intent === "providencia") next.commune = "Providencia";
    if (intent === "kids") next.family = true;
    if (intent === "premium") next.premium = true;
    if (intent === "quick") next.quick = true;
    setFilters(next);
    document.getElementById("malls")?.scrollIntoView({ behavior: "smooth" });
  }

  function toggleCompare(id) {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return [...current, id].slice(-3);
    });
  }

  function showRelatedRoute(mallId) {
    const route = routes.find((item) => item.stops.some((stop) => stop.mallId === mallId));
    if (route) {
      setSelectedMall(null);
      setTimeout(() => document.getElementById(`route-${route.id}`)?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8faf6] text-ink">
      <Header />
      <main>
        <Hero onIntent={applyIntent} mallCount={malls.length} routeCount={routes.length} />
        <QuickIntentButtons onIntent={applyIntent} />

        <section id="tipos" className="section-shell">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="eyebrow">Compra con contexto</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
                Que tipo de compra buscas?
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {["Outlet y descuentos", "Premium y boutique", "Familiar y comodo", "Rapido cerca del hotel"].map(
                (item) => (
                  <div key={item} className="rounded-[2rem] border border-ink/10 bg-white p-5 shadow-sm">
                    <p className="text-lg font-extrabold">{item}</p>
                    <p className="mt-2 text-sm leading-6 text-ink/65">
                      Filtra malls y rutas segun el ritmo del viaje, no solo por nombre.
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <section className="bg-mist/70" id="destacados">
          <div className="section-shell">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Selecciones iniciales</p>
                <h2 className="mt-3 font-display text-4xl font-extrabold">Malls destacados</h2>
              </div>
              <a href="#malls" className="secondary-button">Ver todos</a>
            </div>
            <MallGrid
              malls={featuredMalls}
              compareIds={compareIds}
              onCompare={toggleCompare}
              onSelect={setSelectedMall}
            />
          </div>
        </section>

        <RecommendationQuiz malls={malls} onSelect={setSelectedMall} />
        <RoutesSection routes={routes} malls={malls} />
        <GalleriesSpecial data={galleries} />

        <section id="malls" className="section-shell">
          <div className="mb-8 grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="eyebrow">Busca y filtra</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold">Explora malls y outlets</h2>
              <p className="mt-4 max-w-2xl text-ink/65">
                Usa filtros simples para transformar un listado en una decision de viaje.
              </p>
            </div>
            <MallFilters filters={filters} setFilters={setFilters} malls={malls} />
          </div>
          <MallGrid
            malls={filteredMalls}
            compareIds={compareIds}
            onCompare={toggleCompare}
            onSelect={setSelectedMall}
          />
        </section>

        <CompareMalls malls={malls} selectedIds={compareIds} setSelectedIds={setCompareIds} />
        <TouristTips />
      </main>
      <Footer />
      {selectedMall && (
        <MallDetail
          mall={selectedMall}
          routes={routes}
          isComparing={compareIds.includes(selectedMall.id)}
          onCompare={() => toggleCompare(selectedMall.id)}
          onClose={() => setSelectedMall(null)}
          onRelatedRoute={() => showRelatedRoute(selectedMall.id)}
        />
      )}
    </div>
  );
}

export default App;
