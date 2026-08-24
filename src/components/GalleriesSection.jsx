import { useState, useMemo } from "react";
import { Building2, ChevronDown, MapPin, Navigation, Footprints } from "lucide-react";
import galleries from "../data/curatedGalleries.json";
import { useLanguage } from "../i18n/LanguageContext";
import GalleriesMap from "./GalleriesMap";
import GalleryCard from "./GalleryCard";

const ZONES = [
  "plaza-de-armas",
  "huerfanos-ahumada",
  "bandera-monjitas",
  "santa-lucia",
  "mercado-central",
];

const ZONE_DOT = {
  "plaza-de-armas":    "bg-leaf",
  "huerfanos-ahumada": "bg-gold",
  "bandera-monjitas":  "bg-coral",
  "santa-lucia":       "bg-night",
  "mercado-central":   "bg-teal-600",
};

export default function GalleriesSection() {
  const { t, lang } = useLanguage();
  const gl = t.galleries;

  const [activeZone, setActiveZone] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const filtered = useMemo(
    () => activeZone ? galleries.filter(g => g.zone === activeZone) : galleries,
    [activeZone]
  );

  function handleSelect(id) {
    setSelectedId(prev => prev === id ? null : id);
    const el = document.getElementById(`gallery-card-${id}`);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  }

  function handleZone(zone) {
    setActiveZone(prev => prev === zone ? null : zone);
    setSelectedId(null);
  }

  const touristCount  = galleries.filter(g => g.touristFriendly).length;

  return (
    <section id="galerias" className="bg-mist/40">
      <div className={`section-shell ${isExpanded ? "" : "!py-5 lg:!py-6"}`}>
        <button
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          aria-expanded={isExpanded}
          className="group w-full rounded-3xl border border-ink/8 bg-white/90 px-5 py-4 text-left shadow-sm transition hover:border-leaf/35 hover:shadow-card sm:px-6 sm:py-5"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-leaf/10 text-leaf">
              <Building2 size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="eyebrow">{gl.eyebrow}</p>
              <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight sm:text-3xl">{gl.title}</h2>
              <p className="mt-1 line-clamp-1 max-w-3xl text-sm text-ink/50">{gl.subtitle}</p>
            </div>
            <div className="hidden shrink-0 items-center gap-4 lg:flex">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-ink/55">
                <Building2 size={14} className="text-leaf" />
                {galleries.length} {gl.stats.galleries}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-ink/45">
                <MapPin size={13} className="text-gold" />
                {ZONES.length} {gl.stats.zones}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-ink/45">
                <Footprints size={13} className="text-coral" />
                {touristCount} {gl.stats.walking}
              </span>
            </div>
            <span className="flex shrink-0 items-center gap-2 rounded-full bg-ink px-3 py-2 text-xs font-extrabold text-white transition group-hover:bg-leaf sm:px-4">
              <span className="hidden sm:inline">{isExpanded ? gl.collapseCta : gl.expandCta}</span>
              <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 pl-[3.75rem] text-[11px] font-semibold text-ink/45 lg:hidden">
            <span>{galleries.length} {gl.stats.galleries}</span>
            <span>{ZONES.length} {gl.stats.zones}</span>
            <span>{touristCount} {gl.stats.walking}</span>
          </div>
        </button>

        {isExpanded && (
          <div className="mt-6 animate-[fadeIn_300ms_ease-out]">
            <GalleriesMap
              galleries={galleries}
              selectedId={selectedId}
              onSelect={handleSelect}
            />

            <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => { setActiveZone(null); setSelectedId(null); }}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
              activeZone === null
                ? "bg-ink text-white"
                : "border border-ink/12 bg-white text-ink/60 hover:border-ink/25 hover:text-ink"
            }`}
          >
            {gl.filterAll}
          </button>
          {ZONES.map(zone => (
            <button
              key={zone}
              onClick={() => handleZone(zone)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold transition ${
                activeZone === zone
                  ? "bg-ink text-white"
                  : "border border-ink/12 bg-white text-ink/60 hover:border-ink/25 hover:text-ink"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${ZONE_DOT[zone]}`} />
              {gl.zones[zone]}
            </button>
          ))}
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((gallery, i) => (
            <div key={gallery.id} id={`gallery-card-${gallery.id}`}>
              <GalleryCard
                gallery={gallery}
                index={galleries.indexOf(gallery)}
                isSelected={gallery.id === selectedId}
                onSelect={handleSelect}
              />
            </div>
          ))}
            </div>

            <div className="mt-10 rounded-2xl border border-ink/8 bg-white/80 p-6 text-center">
          <Navigation size={20} className="mx-auto mb-2 text-leaf" />
          <p className="text-sm font-semibold text-ink/55 max-w-lg mx-auto">
            {lang === "es"
              ? "Todas las galerías están en el centro histórico, a menos de 15 minutos caminando entre ellas. Metro: líneas L1 y L2."
              : lang === "pt"
              ? "Todas as galerias ficam no centro histórico, a menos de 15 minutos a pé entre elas. Metrô: linhas L1 e L2."
              : "All galleries are in the historic centre, within 15 minutes' walk of each other. Metro: lines L1 and L2."}
          </p>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
