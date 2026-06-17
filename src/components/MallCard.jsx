import { BadgeCheck, Car, Clock, MapPin, Star, TrainFront } from "lucide-react";

function accentColor(mall) {
  if (mall.premium) return "bg-gold";
  if (mall.outlet) return "bg-coral";
  if (mall.type?.includes("metro")) return "bg-leaf";
  return "bg-night";
}

function MallCard({ mall, onSelect, onCompare, isComparing }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className={`h-1 ${accentColor(mall)}`} />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-ink/40">{mall.commune}</span>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-ink/6 px-2.5 py-1 text-xs font-extrabold text-ink/70">
            <Star size={11} fill="currentColor" /> {mall.touristScore}
          </span>
        </div>

        <button onClick={() => onSelect(mall)} className="mt-2 text-left group/title">
          <h3 className="font-display text-xl font-extrabold leading-tight text-ink transition group-hover/title:text-leaf">
            {mall.name}
          </h3>
        </button>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {mall.type.slice(0, 3).map(tag => (
            <span key={tag} className="tag capitalize">{tag}</span>
          ))}
        </div>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/58 line-clamp-3">
          {mall.description}
        </p>

        <div className="mt-4 rounded-xl bg-mist px-4 py-3">
          <p className="text-xs font-extrabold uppercase tracking-wider text-ink/40">Mejor para</p>
          <p className="mt-0.5 text-sm font-bold text-ink/70">{mall.bestFor.slice(0, 2).join(" · ")}</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-ink/50">
          <span className="flex items-center gap-1.5"><Clock size={13} /> {mall.recommendedTime}</span>
          <span className="flex items-center gap-1.5"><MapPin size={13} /> {mall.priceLevel}</span>
          <span className="flex items-center gap-1.5">
            {mall.type.includes("metro") ? <TrainFront size={13} /> : <Car size={13} />}
            {mall.type.includes("metro") ? "Metro" : "Auto/Uber"}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-2 border-t border-ink/6 pt-4">
          <button onClick={() => onSelect(mall)} className="primary-button flex-1 py-2.5 text-xs">
            Ver ficha
          </button>
          <button
            onClick={() => onCompare(mall.id)}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-xs font-extrabold transition ${
              isComparing
                ? "border-leaf bg-leaf text-white"
                : "border-ink/12 text-ink/55 hover:border-leaf/40 hover:text-leaf"
            }`}
            aria-label={`Comparar ${mall.name}`}
          >
            <BadgeCheck size={14} />
            {isComparing ? "En lista" : "Comparar"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default MallCard;
