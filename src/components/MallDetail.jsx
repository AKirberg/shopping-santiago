import { useEffect } from "react";
import { Car, CheckCircle2, Clock, ExternalLink, MapPin, Route, ShoppingBag, TrainFront, Utensils, X } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { localizeMall } from "../i18n/mallContent";
import { mallMapsUrl } from "../utils/maps";
import ReviewSection from "./ReviewSection";

function mallCanonicalHref(mall) {
  return mall.outlet ? `/outlets/${mall.id}/` : `/malls/${mall.id}/`;
}

function MallDetail({ mall, routes, isComparing, onCompare, onClose, onRelatedRoute }) {
  const { t, lang } = useLanguage();
  const md = t.mallDetail;
  const lm = localizeMall(mall, lang);
  const relatedRoute = routes.find(r => r.stops.some(s => s.mallId === mall.id));
  const mapsUrl = mallMapsUrl(mall);
  const canonicalHref = mallCanonicalHref(mall);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="mx-auto my-8 max-w-3xl overflow-hidden rounded-2xl bg-white shadow-soft">
        <div className="relative">
          {mall.imageUrl ? (
            <div className="relative h-52 w-full overflow-hidden sm:h-64">
              <img src={mall.imageUrl} alt={mall.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
            </div>
          ) : (
            <div className="relative h-40" style={{ background: "linear-gradient(135deg,#1f3144 0%,#12615b 70%,#e36b45 100%)" }} />
          )}
          <button
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-ink/40 text-white backdrop-blur-sm transition hover:bg-ink/60"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={17} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-xs font-extrabold uppercase tracking-widest text-white/60">{mall.commune}</p>
            <h2 className="mt-1 font-display text-3xl font-extrabold text-white drop-shadow">{mall.name}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {mall.type.map(tag => (
                <span key={tag} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold capitalize backdrop-blur-sm">{t.typeLabels?.[tag] ?? tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-sm leading-7 text-ink/68">{lm.description}</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <InfoList title={md.sections.bestFor} items={lm.bestFor} positive />
              <InfoList title={md.sections.notFor} items={lm.notIdealFor} />
              <InfoList title={md.sections.tips} items={lm.tips} positive />
              <InfoList title={md.sections.nearby} items={mall.nearbyAttractions.length ? mall.nearbyAttractions : [md.sections.noData]} />
            </div>

            {mall.stores?.length > 0 && (
              <div className="mt-6">
                <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-ink/40">
                  <ShoppingBag size={13} /> {md.stores?.title}
                </h3>
                <div className="mt-3 grid gap-3">
                  {["anchor","fashion","sport","tech","food","other"].map(cat => {
                    const items = mall.stores.filter(s => s.cat === cat);
                    if (!items.length) return null;
                    return (
                      <div key={cat}>
                        <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-ink/30">
                          {md.stores?.cats?.[cat]}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {items.map(s => (
                            <span key={s.name} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              cat === 'anchor' ? 'bg-ink text-white' :
                              cat === 'food'   ? 'bg-gold/12 text-gold' :
                              cat === 'tech'   ? 'bg-sky-50 text-sky-700' :
                              cat === 'sport'  ? 'bg-leaf/10 text-leaf' :
                              'bg-ink/6 text-ink/65'
                            }`}>
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <ReviewSection mallId={mall.id} mall={mall} />
          </div>

          <aside>
            <div className="rounded-xl bg-mist p-5">
              <div className="grid gap-3.5 text-sm font-semibold text-ink/70">
                <span className="flex items-start gap-3"><TrainFront size={16} className="mt-0.5 shrink-0 text-leaf" />{lm.transport.metro}</span>
                <span className="flex items-center gap-3">
                  <Car size={16} className="shrink-0 text-leaf" />
                  {md.parking}: {mall.transport.parking ? md.yes : md.no} · Uber: {mall.transport.uber ? md.yes : md.no}
                </span>
                <span className="flex items-center gap-3"><Clock size={16} className="shrink-0 text-leaf" />{lm.recommendedTime}</span>
                <span className="flex items-center gap-3"><MapPin size={16} className="shrink-0 text-leaf" />{t.priceLabels?.[mall.priceLevel] ?? mall.priceLevel}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Badge label={md.badges.family} active={mall.familyFriendly} />
                <Badge label={md.badges.outlet} active={mall.outlet} />
                <Badge label={md.badges.premium} active={mall.premium} />
                <FoodBadge level={mall.foodLevel} labels={t.foodLevel} />
              </div>
            </div>

            <div className="mt-4 grid gap-2.5">
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                className="primary-button justify-center bg-leaf hover:bg-leaf/85">
                <ExternalLink size={15} /> {md.mapsBtn}
              </a>
              <button onClick={onCompare} className="secondary-button justify-center">
                <CheckCircle2 size={15} />
                {isComparing ? md.compareRemove : md.compareAdd}
              </button>
              {relatedRoute && (
                <button onClick={onRelatedRoute} className="secondary-button justify-center">
                  <Route size={15} /> {md.relatedRoute}
                </button>
              )}
            </div>

            <p className="mt-4 rounded-xl border border-ink/8 bg-[#f8faf6] p-3.5 text-xs font-medium leading-5 text-ink/45">
              {md.hoursNote}
            </p>
            {mall.officialUrl && (
              <a
                href={mall.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-leaf/25 bg-leaf/6 px-4 py-3 transition hover:bg-leaf/12 hover:border-leaf/40"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-leaf text-white">
                    <ExternalLink size={13} />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-leaf">{md.officialSite}</p>
                    <p className="text-[10px] text-ink/40 font-medium truncate max-w-[140px]">{mall.officialUrl.replace('https://','')}</p>
                  </div>
                </div>
                <ExternalLink size={13} className="shrink-0 text-leaf/50" />
              </a>
            )}
          </aside>
        </div>

        {/* Sticky close button – always visible on mobile */}
        <div className="sticky bottom-0 border-t border-ink/8 bg-white/95 px-6 py-3 backdrop-blur-sm flex gap-2">
          <a
            href={canonicalHref}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-leaf/20 py-3 text-sm font-semibold text-leaf/70 transition hover:border-leaf hover:text-leaf"
          >
            <ExternalLink size={14} /> Ver página completa
          </a>
          <button
            onClick={onClose}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-ink/12 py-3 text-sm font-extrabold text-ink/60 transition hover:border-ink/30 hover:text-ink"
          >
            <X size={15} /> {md.close ?? "Cerrar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoList({ title, items, positive }) {
  return (
    <div>
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink/40">{title}</h3>
      <ul className="mt-2.5 grid gap-2">
        {items.map(item => (
          <li key={item} className="flex gap-2.5 text-sm leading-6 text-ink/68">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${positive ? "bg-leaf" : "bg-coral"}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Badge({ label, active }) {
  return (
    <span className={`rounded-lg px-3 py-2 text-center text-xs font-bold ${active ? "bg-leaf/15 text-leaf" : "bg-white text-ink/35"}`}>
      {label}
    </span>
  );
}

function FoodBadge({ level, labels }) {
  if (!level) return <span className="rounded-lg bg-white px-3 py-2 text-center text-xs font-bold text-ink/35">{labels?.patio || "—"}</span>;
  const isGastro = level === "gastronomico";
  return (
    <span className={`col-span-2 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${
      isGastro ? "bg-gold/15 text-gold" : "bg-ink/5 text-ink/45"
    }`}>
      <Utensils size={12} />
      {labels?.[level] || level}
    </span>
  );
}

export default MallDetail;
