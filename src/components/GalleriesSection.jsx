import { useState, useMemo } from "react";
import { Building2, MapPin, Navigation, Footprints } from "lucide-react";
import galleries from "../data/galleries.json";
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
  const historicCount = galleries.filter(g => g.historic).length;

  return (
    <section id="galerias" className="bg-mist/40">
      <div className="section-shell">

        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">{gl.eyebrow}</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight">{gl.title}</h2>
            <p className="mt-3 max-w-2xl text-base text-ink/55 leading-relaxed">{gl.subtitle}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-1.5 text-right">
            <div className="flex items-center justify-end gap-2 text-sm font-extrabold">
              <Building2 size={16} className="text-leaf" />
              <span>{galleries.length} {gl.stats.galleries}</span>
            </div>
            <div className="flex items-center justify-end gap-2 text-sm font-semibold text-ink/50">
              <MapPin size={14} className="text-gold" />
              <span>{ZONES.length} {gl.stats.zones}</span>
            </div>
            <div className="flex items-center justify-end gap-2 text-sm font-semibold text-ink/50">
              <Footprints size={14} className="text-coral" />
              <span>{touristCount} {gl.stats.walking}</span>
            </div>
          </div>
        </div>

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
    </section>
  );
}
