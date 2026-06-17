import { Clock3, MapPinned, Navigation } from "lucide-react";

function RouteCard({ route, mallMap }) {
  return (
    <article id={`route-${route.id}`} className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-sm">
      <div className="h-2 bg-[linear-gradient(90deg,#12615b,#c28b2c,#e36b45)]" />
      <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-extrabold text-coral">
            <Clock3 size={16} /> {route.duration}
          </p>
          <h3 className="mt-3 text-2xl font-extrabold">{route.title}</h3>
        </div>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mist text-leaf">
          <MapPinned size={22} />
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-ink/65">{route.summary}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {route.bestFor.map((tag) => <span key={tag} className="tag">{tag}</span>)}
      </div>
      <div className="mt-6 grid gap-0">
        {route.stops.map((stop, index) => {
          const mall = mallMap[stop.mallId];
          const isLast = index === route.stops.length - 1;
          return (
            <div key={`${route.id}-${stop.mallId}`} className="grid grid-cols-[44px_1fr] gap-3">
              <div className="flex flex-col items-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf text-sm font-extrabold text-white">
                  {index + 1}
                </span>
                {!isLast && <span className="h-full min-h-8 w-px bg-ink/15" />}
              </div>
              <div className={`rounded-2xl bg-mist p-4 ${isLast ? "" : "mb-3"}`}>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                  {mall?.commune || "Santiago"}
                </p>
                <p className="mt-1 flex items-center gap-2 text-base font-extrabold">
                  <Navigation size={15} className="text-coral" /> {mall?.name || stop.mallId}
                </p>
                <p className="mt-2 text-sm leading-6 text-ink/65">{stop.note}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 rounded-2xl border border-ink/10 bg-[#f8faf6] p-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-coral">Tips de ruta</p>
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-ink/65">
          {route.tips.map((tip) => <li key={tip}>• {tip}</li>)}
        </ul>
      </div>
      </div>
    </article>
  );
}

export default RouteCard;
