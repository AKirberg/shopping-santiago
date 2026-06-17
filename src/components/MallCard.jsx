import { BadgeCheck, Car, Clock, MapPin, Star, TrainFront } from "lucide-react";

function MallCard({ mall, onSelect, onCompare, isComparing }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <button onClick={() => onSelect(mall)} className="min-h-36 bg-left p-5 text-left text-white" style={{ background: "linear-gradient(135deg,#12615b,#1f3144 55%,#e36b45)" }}>
        <div className="flex items-start justify-between gap-3">
          <span className="tag bg-white text-ink">{mall.commune}</span>
          <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold backdrop-blur">
            <Star size={13} fill="currentColor" /> {mall.touristScore}/10
          </span>
        </div>
        <h3 className="mt-9 text-2xl font-extrabold leading-tight">{mall.name}</h3>
      </button>
      <div className="flex flex-1 flex-col p-5">
        <p className="line-clamp-3 text-sm leading-6 text-ink/68">{mall.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {mall.type.slice(0, 4).map((tag) => <span key={tag} className="tag">{tag}</span>)}
        </div>
        <div className="mt-5 rounded-2xl bg-mist p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">Mejor para</p>
          <p className="mt-1 text-sm font-extrabold leading-6 text-ink/75">{mall.bestFor.slice(0, 2).join(" · ")}</p>
        </div>
        <div className="mt-5 grid gap-2 text-sm font-bold text-ink/65">
          <span className="flex items-center gap-2"><Clock size={16} /> {mall.recommendedTime}</span>
          <span className="flex items-center gap-2"><MapPin size={16} /> {mall.priceLevel}</span>
          <span className="flex items-center gap-2">
            {mall.type.includes("metro") ? <TrainFront size={16} /> : <Car size={16} />}
            {mall.type.includes("metro") ? "Conveniente en metro" : "Mejor con auto o Uber"}
          </span>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={() => onSelect(mall)} className="primary-button flex-1">Ver ficha</button>
          <button
            onClick={() => onCompare(mall.id)}
            className={`icon-button ${isComparing ? "border-leaf bg-leaf text-white hover:text-white" : ""}`}
            aria-label={`Comparar ${mall.name}`}
          >
            <BadgeCheck size={19} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default MallCard;
