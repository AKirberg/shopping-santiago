import { Car, CheckCircle2, Clock, MapPin, Route, TrainFront, X } from "lucide-react";

function MallDetail({ mall, routes, isComparing, onCompare, onClose, onRelatedRoute }) {
  const relatedRoute = routes.find((routeItem) => routeItem.stops.some((stop) => stop.mallId === mall.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="mx-auto my-6 max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-soft">
        <div className="bg-ink p-6 text-white" style={{ background: "linear-gradient(135deg,#1f3144,#12615b 60%,#e36b45)" }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-white/65">{mall.commune}</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold">{mall.name}</h2>
            </div>
            <button className="icon-button border-white/20 bg-white/10 text-white hover:text-ink" onClick={onClose} aria-label="Cerrar">
              <X size={19} />
            </button>
          </div>
        </div>
        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-base leading-7 text-ink/70">{mall.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {mall.type.map((tag) => <span key={tag} className="tag">{tag}</span>)}
            </div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <InfoList title="Mejor para" items={mall.bestFor} positive />
              <InfoList title="No ideal para" items={mall.notIdealFor} />
              <InfoList title="Tips para turistas" items={mall.tips} positive />
              <InfoList title="Atracciones cercanas" items={mall.nearbyAttractions.length ? mall.nearbyAttractions : ["Sin atracciones cargadas aun"]} />
            </div>
          </div>
          <aside className="rounded-[1.5rem] bg-mist p-5">
            <div className="grid gap-4 text-sm font-bold text-ink/72">
              <span className="flex items-start gap-3"><TrainFront size={18} className="mt-0.5 text-leaf" /> {mall.transport.metro}</span>
              <span className="flex items-center gap-3"><Car size={18} className="text-leaf" /> Uber/Taxi: {mall.transport.uber ? "si" : "no"} · Parking: {mall.transport.parking ? "si" : "no"}</span>
              <span className="flex items-center gap-3"><Clock size={18} className="text-leaf" /> Tiempo recomendado: {mall.recommendedTime}</span>
              <span className="flex items-center gap-3"><MapPin size={18} className="text-leaf" /> Nivel de precios: {mall.priceLevel}</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-extrabold">
              <Badge label="Familiar" active={mall.familyFriendly} />
              <Badge label="Outlet" active={mall.outlet} />
              <Badge label="Premium" active={mall.premium} />
              <Badge label="Comida" active={mall.foodExperience} />
            </div>
            <p className="mt-5 rounded-2xl border border-ink/10 bg-white p-4 text-xs font-bold leading-5 text-ink/60">
              Confirma horarios oficiales antes de ir. Este prototipo evita publicar horarios no verificados.
            </p>
            <div className="mt-5 grid gap-3">
              <button onClick={onCompare} className="primary-button">
                <CheckCircle2 size={17} /> {isComparing ? "Quitar de comparar" : "Comparar"}
              </button>
              {relatedRoute && (
                <button onClick={onRelatedRoute} className="secondary-button">
                  <Route size={17} /> Ver ruta relacionada
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function InfoList({ title, items, positive }) {
  return (
    <div>
      <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-ink/45">{title}</h3>
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-ink/70">
            <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${positive ? "bg-leaf" : "bg-coral"}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Badge({ label, active }) {
  return <span className={`rounded-full px-3 py-2 text-center ${active ? "bg-leaf text-white" : "bg-white text-ink/45"}`}>{label}</span>;
}

export default MallDetail;
