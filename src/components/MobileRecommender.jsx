import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ExternalLink, MapPin, Navigation, Plus, Route, ShoppingBag, X } from "lucide-react";

const STEP_KEYS = ["category", "time", "transport"];

function ResultCard({ mall, index, q, selected, onAdd, onOpen, primary = false, canAdd = true, routeFull = false, maxRouteStops = 0 }) {
  if (!mall) return null;

  return (
    <article className="min-w-0 rounded-3xl border border-ink/10 bg-white p-4 shadow-card">
      <div className="flex min-w-0 items-start gap-3">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white ${index === 0 ? "bg-leaf" : "bg-ink/25"}`}>
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="min-w-0 text-base font-extrabold leading-tight">{mall.name}</h3>
            {mall.isNearest && <span className="rounded-full bg-leaf px-2 py-0.5 text-[10px] font-extrabold text-white">{q.nearest}</span>}
          </div>
          {(mall.commune || mall.recommendedTime || mall.distanceKm != null) && (
            <p className="mt-1 text-xs font-semibold text-ink/50">
              {mall.commune}
              {mall.recommendedTime && <>{mall.commune ? " · " : ""}{mall.recommendedTime}</>}
              {mall.distanceKm != null && (
                <span className={`${mall.commune || mall.recommendedTime ? "ml-1.5" : ""} font-bold text-leaf`}>
                  {mall.commune || mall.recommendedTime ? "· " : ""}{mall.distanceKm} km
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {mall.reasons?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {mall.reasons.slice(0, 2).map(reason => (
            <span key={reason} className="max-w-full break-words rounded-full border border-ink/10 bg-mist px-2.5 py-1 text-[10px] font-bold text-ink/60">
              {reason}
            </span>
          ))}
        </div>
      )}

      <div className={`mt-4 grid gap-2 ${canAdd ? "grid-cols-2" : "grid-cols-1"}`}>
        <button onClick={() => onOpen(mall)} className="rounded-xl border border-ink/15 px-3 py-2.5 text-xs font-extrabold text-ink/70">
          {primary ? q.mobile.chooseMall : q.mobile.viewMall}
        </button>
        {canAdd && (
          <button
            onClick={() => onAdd(mall.id)}
            disabled={!selected && routeFull}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-extrabold ${
              selected ? "bg-leaf text-white" : routeFull ? "bg-ink/15 text-ink/40" : "bg-ink text-white"
            }`}
          >
            {selected ? <Check size={14} /> : <Plus size={14} />}
            {selected ? q.mobile.added : routeFull ? q.mobile.routeLimit.replace("{count}", maxRouteStops) : q.mobile.addToRoute}
          </button>
        )}
      </div>
    </article>
  );
}

export default function MobileRecommender({
  address,
  hasLocation,
  onRequestLocation,
  answers,
  setAnswer,
  toggleCategory,
  recommendations,
  selectedMalls,
  selectedIds,
  toggleRouteMall,
  routeAnalysis,
  routeUrl,
  routeMalls,
  canBuildRoute,
  maxRouteStops,
  onOpenMall,
  q,
  step,
  setStep,
}) {
  const [routeOpen, setRouteOpen] = useState(false);
  const activeField = useMemo(() => q.fields.find(field => field.key === STEP_KEYS[step - 1]), [q.fields, step]);
  const primaryMall = recommendations[0];
  const alternatives = recommendations.slice(1, 4);
  const progress = hasLocation ? Math.min(step, 4) : 0;
  const routeFitsTime = Boolean(routeUrl && routeAnalysis?.fitsTime);

  useEffect(() => {
    if (!hasLocation) setRouteOpen(false);
  }, [hasLocation]);

  if (!hasLocation) {
    return (
      <div className="rounded-3xl border border-gold/30 bg-gold/8 p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold"><MapPin size={21} /></span>
        <h3 className="mt-4 font-display text-2xl font-extrabold">{q.locationRequiredTitle}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-ink/55">{q.locationRequired}</p>
        <button onClick={onRequestLocation} className="primary-button mt-5">
          <MapPin size={14} /> {q.locationCta}
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="rounded-3xl border border-ink/8 bg-mist/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-leaf">{q.locationLabel}</p>
            <p className="mt-1 truncate text-sm font-extrabold text-ink/75">{address}</p>
          </div>
          <button onClick={onRequestLocation} className="shrink-0 rounded-full border border-leaf/25 bg-white px-3 py-1.5 text-[10px] font-extrabold text-leaf">
            {q.mobile.edit}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-extrabold uppercase tracking-wider text-ink/45">
            {step === 4 ? q.mobile.resultsStep : q.mobile.step.replace("{step}", step).replace("{total}", 3)}
          </p>
          {step < 4 && <span className="text-xs font-bold text-ink/35">{q.mobile.preferences}</span>}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {[1, 2, 3, 4].map(number => (
            <span key={number} className={`h-1.5 rounded-full ${number <= progress ? "bg-leaf" : "bg-ink/10"}`} />
          ))}
        </div>
      </div>

      {step < 4 && activeField && (
        <div className="mt-7">
          <h3 className="font-display text-3xl font-extrabold leading-tight">{activeField.label.replace(" (puedes elegir varias)", "")}</h3>
          {activeField.key === "category" && <p className="mt-2 text-sm text-ink/50">{q.mobile.multipleChoice}</p>}

          <div className="mt-5 grid gap-2">
            {activeField.options.map(option => {
              const isSelected = activeField.key === "category"
                ? answers.category.includes(option.v)
                : answers[activeField.key] === option.v;

              return (
                <button
                  key={option.v}
                  onClick={() => activeField.key === "category" ? toggleCategory(option.v) : setAnswer(activeField.key, option.v)}
                  aria-pressed={isSelected}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-sm font-extrabold transition ${
                    isSelected ? "border-ink bg-ink text-white" : "border-ink/10 bg-white text-ink/65"
                  }`}
                >
                  {option.l}
                  {isSelected && <Check size={16} />}
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-ink/12 px-4 py-3 text-sm font-extrabold text-ink/60 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowLeft size={15} /> {q.mobile.back}
            </button>
            <button onClick={() => setStep(step + 1)} className="flex items-center justify-center gap-1.5 rounded-2xl bg-ink px-4 py-3 text-sm font-extrabold text-white">
              {q.mobile.continue} <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="mt-7">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">{q.mobile.bestMatch}</p>
              <h3 className="mt-2 font-display text-3xl font-extrabold">{q.mobile.yourRecommendation}</h3>
            </div>
            <button onClick={() => setStep(1)} className="shrink-0 text-xs font-extrabold text-leaf">{q.mobile.editChoices}</button>
          </div>

          {primaryMall ? (
            <div className="mt-5">
              <ResultCard
                mall={primaryMall}
                index={0}
                q={q}
                selected={selectedIds.includes(primaryMall.id)}
                onAdd={toggleRouteMall}
                onOpen={onOpenMall}
                primary
                canAdd={canBuildRoute}
                routeFull={selectedIds.length >= maxRouteStops}
                maxRouteStops={maxRouteStops}
              />
            </div>
          ) : (
            <p className="mt-5 rounded-2xl bg-mist p-4 text-sm font-semibold text-ink/60">{q.mobile.noResults}</p>
          )}
          {!canBuildRoute && <p className="mt-3 text-sm font-semibold text-ink/55">{q.mobile.shortVisit}</p>}

          {alternatives.length > 0 && (
            <details className="mt-5 rounded-2xl border border-ink/8 bg-white p-4">
              <summary className="cursor-pointer list-none text-sm font-extrabold text-ink/70">{q.mobile.seeAlternatives}</summary>
              <div className="mt-4 grid gap-3">
                {alternatives.map((mall, index) => (
                  <ResultCard
                    key={mall.id}
                    mall={mall}
                    index={index + 1}
                    q={q}
                    selected={selectedIds.includes(mall.id)}
                    onAdd={toggleRouteMall}
                    onOpen={onOpenMall}
                    canAdd={canBuildRoute}
                    routeFull={selectedIds.length >= maxRouteStops}
                    maxRouteStops={maxRouteStops}
                  />
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {selectedMalls.length > 0 && (
        <button
          onClick={() => setRouteOpen(true)}
          className="fixed bottom-4 left-4 right-4 z-40 flex min-w-0 items-center gap-3 rounded-2xl bg-ink px-4 py-3.5 text-left text-white shadow-2xl"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-leaf"><Route size={17} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-white/55">{q.mobile.myRoute}</span>
            <span className="block truncate text-sm font-extrabold">
              {selectedMalls.length} {selectedMalls.length === 1 ? q.mobile.mallSingle : q.mobile.mallPlural}
              {routeAnalysis?.totalTime ? ` · ${routeAnalysis.totalTime}` : ""}
            </span>
          </span>
          <ArrowRight size={17} className="shrink-0" />
        </button>
      )}

      {routeOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-ink/40 p-0 sm:items-center sm:justify-center sm:p-4">
          <button aria-label={q.mobile.close} className="absolute inset-0" onClick={() => setRouteOpen(false)} />
          <section className="relative w-full max-w-lg rounded-t-3xl bg-[#f8faf6] p-5 shadow-2xl sm:rounded-3xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">{q.mobile.myRoute}</p>
                <h3 className="mt-2 font-display text-3xl font-extrabold">{q.mobile.routeReady}</h3>
              </div>
              <button onClick={() => setRouteOpen(false)} className="rounded-full border border-ink/10 p-2 text-ink/50"><X size={16} /></button>
            </div>

            <ol className="mt-5 grid gap-2">
              {routeMalls.map((mall, index) => (
                <li key={mall.id} className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-white px-3 py-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-leaf text-xs font-extrabold text-white">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-extrabold">{mall.name}</span>
                  <button onClick={() => toggleRouteMall(mall.id)} className="text-xs font-extrabold text-coral">{q.mobile.remove}</button>
                </li>
              ))}
            </ol>

            <div className={`mt-4 rounded-2xl p-4 text-sm ${routeAnalysis?.fitsTime === false ? "bg-coral/8 text-coral" : "bg-leaf/8 text-leaf"}`}>
              <p className="font-extrabold">{q.routeTimeLabel}: {routeAnalysis?.shoppingTime || "—"}</p>
              <p className="mt-1 text-xs font-semibold opacity-80">{q.routeTravelLabel}: {routeAnalysis?.travelTime || "—"}</p>
              <p className="mt-1 text-xs font-semibold opacity-80">{q.routeTotalLabel}: {routeAnalysis?.totalTime || "—"}</p>
              {routeAnalysis?.idealDistanceKm > 0 && (
                <p className="mt-1 text-xs font-semibold opacity-80">{q.mobile.routeDistance}: {routeAnalysis.idealDistanceKm} km</p>
              )}
              <p className="mt-1 text-xs font-semibold opacity-80">
                {routeAnalysis?.fitsTime === false
                  ? q.routeExceedsTime
                  : routeUrl ? q.mobile.optimizedOrder : q.routeSelectMore}
              </p>
            </div>

            {routeFitsTime ? (
              <a href={routeUrl} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-coral px-4 py-3.5 text-sm font-extrabold text-white">
                <ExternalLink size={16} /> {q.routeCta}
              </a>
            ) : (
              <button onClick={() => { setRouteOpen(false); setStep(4); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3.5 text-sm font-extrabold text-white">
                <ShoppingBag size={16} /> {q.mobile.keepExploring}
              </button>
            )}
          </section>
        </div>
      )}
    </div>
  );
}