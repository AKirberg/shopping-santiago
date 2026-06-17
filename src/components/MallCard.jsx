import { AlertTriangle, BadgeCheck, Car, Clock, ExternalLink, MapPin, Star, TrainFront } from "lucide-react";

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

function MallCard({ mall, onSelect, onCompare, isComparing, availableHours }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mall.mapsQuery || mall.name + " Santiago")}`;
  const minHours = parseMinHours(mall.recommendedTime);
  const tooLong = availableHours !== null && availableHours !== undefined && availableHours < minHours;

  return (
    <article className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-soft ${
      tooLong ? "border-coral/30" : "border-ink/8"
    }`}>
      <div className={`h-1 ${accentColor(mall)}`} />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-ink/40">{mall.commune}</span>
          <div className="flex items-center gap-1.5">
            {tooLong && (
              <span className="flex items-center gap-1 rounded-full bg-coral/10 px-2 py-0.5 text-xs font-extrabold text-coral">
                <AlertTriangle size={10} /> Tiempo justo
              </span>
            )}
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-ink/6 px-2 py-1 text-xs font-extrabold text-ink/65">
              <Star size={10} fill="currentColor" /> {mall.touristScore}
            </span>
          </div>
        </div>

        <button onClick={() => onSelect(mall)} className="mt-1.5 text-left group/title">
          <h3 className="font-display text-xl font-extrabold leading-tight text-ink transition group-hover/title:text-leaf">
            {mall.name}
          </h3>
        </button>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {mall.type.slice(0, 3).map(tag => (
            <span key={tag} className="tag capitalize">{tag}</span>
          ))}
        </div>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/55 line-clamp-2">
          {mall.description}
        </p>

        <div className="mt-3 rounded-xl bg-mist px-3.5 py-2.5">
          <p className="text-xs font-bold text-ink/60">
            <span className="text-xs font-extrabold uppercase tracking-wider text-ink/40">Mejor para · </span>
            {mall.bestFor.slice(0, 2).join(" · ")}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-ink/45">
          <span className={`flex items-center gap-1 ${tooLong ? "font-extrabold text-coral" : ""}`}>
            <Clock size={12} /> {mall.recommendedTime}
          </span>
          <span className="flex items-center gap-1"><MapPin size={12} /> {mall.priceLevel}</span>
          <span className="flex items-center gap-1">
            {mall.type.includes("metro") ? <TrainFront size={12} /> : <Car size={12} />}
            {mall.type.includes("metro") ? "Metro" : "Auto/Uber"}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-ink/6 pt-3.5">
          <button onClick={() => onSelect(mall)} className="primary-button flex-1 py-2 text-xs">
            Ver ficha
          </button>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink/50 transition hover:border-leaf/40 hover:text-leaf"
            title="Ver en Google Maps"
            aria-label="Ver en Google Maps"
          >
            <ExternalLink size={14} />
          </a>
          <button
            onClick={() => onCompare(mall.id)}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${
              isComparing
                ? "border-leaf bg-leaf text-white"
                : "border-ink/10 text-ink/50 hover:border-leaf/40 hover:text-leaf"
            }`}
            aria-label="Comparar"
            title="Comparar"
          >
            <BadgeCheck size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default MallCard;
