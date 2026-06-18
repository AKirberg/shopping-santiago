import { Clock, ExternalLink, Footprints, MapPin, Star, TrainFront } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

const ZONE_COLOR = {
  "plaza-de-armas":    "bg-leaf/15 text-leaf",
  "huerfanos-ahumada": "bg-gold/15 text-gold",
  "bandera-monjitas":  "bg-coral/15 text-coral",
  "santa-lucia":       "bg-night/15 text-night",
  "meiggs":            "bg-ink/10 text-ink/60",
  "mercado-central":   "bg-teal-600/10 text-teal-700",
};

const ZONE_DOT = {
  "plaza-de-armas":    "bg-leaf",
  "huerfanos-ahumada": "bg-gold",
  "bandera-monjitas":  "bg-coral",
  "santa-lucia":       "bg-night",
  "meiggs":            "bg-ink/50",
  "mercado-central":   "bg-teal-600",
};

export default function GalleryCard({ gallery, index, isSelected, onSelect }) {
  const { t, lang } = useLanguage();
  const gl = t.galleries;
  const desc = gallery.description?.[lang] || gallery.description?.es || "";

  const walkingUrl = `https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=${gallery.lat},${gallery.lng}`;

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-soft cursor-pointer ${
        isSelected ? "border-leaf ring-2 ring-leaf/30" : "border-ink/8"
      }`}
      onClick={() => onSelect(gallery.id)}
    >
      <div className="relative flex h-10 items-center justify-between bg-ink/4 px-4">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${ZONE_DOT[gallery.zone] || "bg-ink/40"}`} />
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${ZONE_COLOR[gallery.zone] || "bg-ink/10 text-ink/60"}`}>
            {gl.zones[gallery.zone]}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {gallery.historic && (
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-bold text-gold">
              {gl.badges.historic}
            </span>
          )}
          {gallery.touristFriendly && (
            <span className="rounded-full bg-leaf/15 px-2 py-0.5 text-xs font-bold text-leaf">
              {gl.badges.touristFriendly}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-extrabold text-white">
                {index + 1}
              </span>
              <h3 className="font-display text-lg font-extrabold leading-tight">{gallery.name}</h3>
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-ink/50">
              <MapPin size={11} /> {gallery.address}
            </p>
          </div>
          {gallery.year && (
            <span className="shrink-0 rounded-lg bg-mist px-2 py-1 text-xs font-extrabold text-ink/50">
              {gallery.year}
            </span>
          )}
        </div>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/60 line-clamp-3">{desc}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {gallery.specialties.slice(0, 4).map(s => (
            <span key={s} className="tag capitalize">{s}</span>
          ))}
        </div>

        {gallery.highlights?.length > 0 && (
          <div className="mt-3 rounded-xl bg-mist px-3.5 py-2.5">
            <p className="text-xs text-ink/55">
              <span className="font-extrabold uppercase tracking-wider text-ink/40">{gl.highlights} · </span>
              {gallery.highlights.slice(0, 2).join(" · ")}
            </p>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-ink/45">
          <span className="flex items-center gap-1"><Clock size={11} /> {gallery.openHours}</span>
          <span className="flex items-center gap-1"><TrainFront size={11} /> {gallery.nearbyMetro}</span>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-ink/6 pt-3.5">
          <a
            href={gallery.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="secondary-button flex-1 py-2 text-xs text-center"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink size={12} className="inline mr-1" />
            {gl.mapsCta}
          </a>
          <a
            href={walkingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="primary-button flex-1 py-2 text-xs text-center"
            onClick={e => e.stopPropagation()}
          >
            <Footprints size={12} className="inline mr-1" />
            {gl.walkingCta}
          </a>
        </div>
      </div>
    </article>
  );
}
