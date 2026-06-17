import { Clock3, ExternalLink, MapPinned, Navigation } from "lucide-react";

const gradients = [
  "from-leaf to-night",
  "from-night to-coral",
  "from-coral to-gold",
  "from-gold to-leaf",
  "from-night to-leaf",
  "from-leaf to-coral"
];

function buildMapsUrl(stops, mallMap) {
  const queries = stops
    .map(s => mallMap[s.mallId]?.mapsQuery)
    .filter(Boolean)
    .map(q => encodeURIComponent(q));
  if (queries.length === 0) return null;
  if (queries.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${queries[0]}`;
  }
  return `https://www.google.com/maps/dir/${queries.join("/")}`;
}

function RouteCard({ route, mallMap, index = 0 }) {
  const gradient = gradients[index % gradients.length];
  const mapsUrl = buildMapsUrl(route.stops, mallMap);

  return (
    <article id={`route-${route.id}`} className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-card">
      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-coral">
                <Clock3 size={13} /> {route.duration}
              </span>
              <span className="text-ink/20">·</span>
              <span className="text-xs font-bold text-ink/40">{route.stops.length} parada{route.stops.length !== 1 ? "s" : ""}</span>
            </div>
            <h3 className="mt-1.5 font-display text-xl font-extrabold leading-tight">{route.title}</h3>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mist">
            <MapPinned size={18} className="text-leaf" />
          </span>
        </div>

        <p className="mt-3 text-sm leading-6 text-ink/55">{route.summary}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {route.bestFor.map(tag => <span key={tag} className="tag">{tag}</span>)}
        </div>

        <div className="mt-5 grid gap-0">
          {route.stops.map((stop, i) => {
            const mall = mallMap[stop.mallId];
            const isLast = i === route.stops.length - 1;
            return (
              <div key={`${route.id}-${stop.mallId}-${i}`} className="grid grid-cols-[32px_1fr] gap-3">
                <div className="flex flex-col items-center">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-extrabold text-white">
                    {i + 1}
                  </span>
                  {!isLast && <span className="my-1 w-px flex-1 bg-ink/10" />}
                </div>
                <div className={`rounded-xl bg-[#f8faf6] p-3 ${isLast ? "" : "mb-3"}`}>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-ink/35">
                    {mall?.commune || "Santiago"}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-extrabold">
                    <Navigation size={12} className="shrink-0 text-coral" />
                    {mall?.name || stop.mallId}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-ink/50">{stop.note}</p>
                </div>
              </div>
            );
          })}
        </div>

        {route.tips.length > 0 && (
          <div className="mt-4 rounded-xl bg-mist px-4 py-3">
            <ul className="grid gap-1 text-xs leading-5 text-ink/55">
              {route.tips.map(tip => (
                <li key={tip} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf/50" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-leaf/25 bg-leaf/8 px-4 py-3 text-sm font-extrabold text-leaf transition hover:bg-leaf/15"
          >
            <ExternalLink size={15} />
            {route.stops.length > 1 ? "Abrir ruta en Google Maps" : "Ver en Google Maps"}
          </a>
        )}
      </div>
    </article>
  );
}

export default RouteCard;
