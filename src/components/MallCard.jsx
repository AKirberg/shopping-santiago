import { AlertTriangle, BadgeCheck, Car, Clock, ExternalLink, MapPin, Star, TrainFront, Utensils } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { localizeMall } from "../i18n/mallContent";
import { mallMapsUrl } from "../utils/maps";
import { ReviewSummary } from "./ReviewSection";

function accentColor(mall) {
  if (mall.premium) return "bg-gold";
  if (mall.outlet) return "bg-coral";
  if (mall.type?.includes("metro")) return "bg-leaf";
  return "bg-night";
}

function parseMinHours(timeStr) {
  const match = timeStr?.match(/(\d+)/);
  return match ? parseInt(match[1]) : 2;
}

/** Returns the canonical SEO path for a mall (used by crawlable links) */
function mallCanonicalHref(mall) {
  return mall.outlet ? `/outlets/${mall.id}/` : `/malls/${mall.id}/`;
}

function MallCard({ mall, onSelect, onCompare, isComparing, availableHours }) {
  const { t, lang } = useLanguage();
  const mc = t.mallCard;
  const lm = localizeMall(mall, lang);
  const mapsUrl = mallMapsUrl(mall);
  const canonicalHref = mallCanonicalHref(mall);
  const minHours = parseMinHours(mall.recommendedTime);
  const tooLong = availableHours !== null && availableHours !== undefined && availableHours < minHours;

  function handleCardClick(e) {
    // If onSelect is provided (home context), open modal and prevent navigation
    if (onSelect) {
      e.preventDefault();
      onSelect(mall);
    }
    // Otherwise allow normal <a> navigation to canonical page
  }

  return (
    <article className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-soft ${
      tooLong ? "border-coral/30" : "border-ink/8"
    }`}>
      <a
        href={canonicalHref}
        onClick={handleCardClick}
        className="relative block h-44 w-full overflow-hidden bg-ink/8"
      >
        {mall.imageUrl ? (
          <img
            src={mall.imageUrl}
            alt={mall.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className={`h-full w-full ${accentColor(mall)} opacity-20`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-white/70">{mall.commune}</p>
            <h3 className="mt-0.5 font-display text-xl font-extrabold leading-tight text-white drop-shadow">
              {mall.name}
            </h3>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-xs font-extrabold text-white backdrop-blur-sm">
            <Star size={10} fill="currentColor" /> {mall.touristScore}
          </span>
        </div>
        {tooLong && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-coral px-2 py-1 text-xs font-extrabold text-white shadow">
            <AlertTriangle size={10} /> {mc.timeTight}
          </div>
        )}
      </a>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {mall.touristZone === "turistico" && (
            <span className="flex items-center gap-1 rounded-full bg-leaf/12 px-2.5 py-0.5 text-xs font-extrabold text-leaf">
              ✦ {mc.zoneTuristico}
            </span>
          )}
          {mall.touristZone === "alternativo" && (
            <span className="flex items-center gap-1 rounded-full bg-ink/8 px-2.5 py-0.5 text-xs font-bold text-ink/50">
              ↗ {mc.zoneAlternativo}
            </span>
          )}
          {mall.airportRoute && (
            <span className="flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-extrabold text-sky-700">
              ✈ {mc.airportRoute}
            </span>
          )}
          {mall.type.slice(0, 3).map(tag => (
            <span key={tag} className="tag capitalize">{t.typeLabels?.[tag] ?? tag}</span>
          ))}
        </div>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/55 line-clamp-2">
          {lm.description}
        </p>

        <div className="mt-3 rounded-xl bg-mist px-3.5 py-2.5">
          <p className="text-xs font-bold text-ink/60">
            <span className="text-xs font-extrabold uppercase tracking-wider text-ink/40">{mc.bestFor} · </span>
            {lm.bestFor.slice(0, 2).join(" · ")}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-ink/45">
          <span className={`flex items-center gap-1 ${tooLong ? "font-extrabold text-coral" : ""}`}>
            <Clock size={12} /> {lm.recommendedTime}
          </span>
          <span className="flex items-center gap-1"><MapPin size={12} /> {t.priceLabels?.[mall.priceLevel] ?? mall.priceLevel}</span>
          <span className="flex items-center gap-1">
            {mall.type.includes("metro") ? <TrainFront size={12} /> : <Car size={12} />}
            {mall.type.includes("metro") ? "Metro" : "Auto/Uber"}
          </span>
          {mall.foodLevel && (
            <span className={`flex items-center gap-1 font-bold ${
              mall.foodLevel === "gastronomico" ? "text-gold" : "text-ink/40"
            }`}>
              <Utensils size={12} />
              {t.foodLevel[mall.foodLevel]}
            </span>
          )}
        </div>
        <div className="mt-2">
          <ReviewSummary mallId={mall.id} />
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-ink/6 pt-3.5">
          {/* Canonical crawlable link — opens modal on home via onClick */}
          <a
            href={canonicalHref}
            onClick={handleCardClick}
            className="primary-button flex-1 py-2 text-xs justify-center"
          >
            {mc.viewDetails}
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink/50 transition hover:border-leaf/40 hover:text-leaf"
            title={mc.mapsLabel}
            aria-label={mc.mapsLabel}
          >
            <ExternalLink size={15} />
          </a>
          <button
            onClick={() => onCompare?.(mall.id)}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition ${
              isComparing
                ? "border-leaf bg-leaf text-white"
                : "border-ink/10 text-ink/50 hover:border-leaf/40 hover:text-leaf"
            }`}
            aria-label="Comparar"
            title="Comparar"
          >
            <BadgeCheck size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default MallCard;
