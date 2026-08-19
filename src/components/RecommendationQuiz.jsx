import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ExternalLink, MapPin, Navigation, Sparkles } from "lucide-react";
import { getRecommendations } from "../utils/scoring";
import { useLanguage } from "../i18n/LanguageContext";
import { routeMapsUrl } from "../utils/maps";
import { analyzeMallRoute } from "../utils/routePlanning";

const initialAnswers = {
  category: ["ropa"],
  time: "3-4 horas",
  transport: "Metro",
  withKids: "No",
  goal: "variedad",
};

function RecommendationQuiz({ malls, onSelect, userCoords, address, onRequestLocation }) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [selectedIds, setSelectedIds] = useState([]);
  const { t } = useLanguage();
  const q = t.quiz;
  const hasLocation = Boolean(userCoords && address?.trim());
  const canBuildRoute = ["3-4 horas", "medio día", "día completo"].includes(answers.time);

  const recommendations = useMemo(
    () => hasLocation ? getRecommendations(malls, answers, userCoords).slice(0, 4) : [],
    [answers, malls, userCoords, hasLocation]
  );
  const selectedMalls = useMemo(
    () => selectedIds
      .map(id => recommendations.find(mall => mall.id === id))
      .filter(Boolean),
    [selectedIds, recommendations]
  );
  const routeUrl = useMemo(() => {
    if (selectedMalls.length < 2) return null;
    const mallMap = Object.fromEntries(malls.map(mall => [mall.id, mall]));
    return routeMapsUrl(selectedMalls.map(mall => ({ mallId: mall.id })), mallMap, userCoords);
  }, [malls, selectedMalls, userCoords]);
  const routeAnalysis = useMemo(
    () => canBuildRoute ? analyzeMallRoute(selectedMalls, userCoords, answers.time) : null,
    [answers.time, canBuildRoute, selectedMalls, userCoords]
  );

  useEffect(() => {
    setSelectedIds(current => current.filter(id => recommendations.some(mall => mall.id === id)));
  }, [recommendations]);

  useEffect(() => {
    if (!canBuildRoute) setSelectedIds([]);
  }, [canBuildRoute]);

  function set(key, value) {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }

  function toggleCategory(value) {
    setAnswers(prev => {
      const categories = Array.isArray(prev.category) ? prev.category : [prev.category];
      if (categories.includes(value)) {
        return categories.length > 1
          ? { ...prev, category: categories.filter(category => category !== value) }
          : prev;
      }
      return { ...prev, category: [...categories, value] };
    });
  }

  function applyRecommendedOrder() {
    if (routeAnalysis?.recommendedOrderIds?.length) {
      setSelectedIds(routeAnalysis.recommendedOrderIds);
    }
  }

  function toggleRouteMall(mallId) {
    setSelectedIds(current =>
      current.includes(mallId)
        ? current.filter(id => id !== mallId)
        : [...current, mallId]
    );
  }

  return (
    <section id="quiz" className="bg-white">
      <div className="section-shell">
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow">{q.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight">{q.title}</h2>
          <p className="mt-3 text-sm leading-6 text-ink/55">{q.subtitle}</p>
        </div>

        {!hasLocation ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-gold/35 bg-gold/8 px-6 py-8 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold">
              <MapPin size={21} />
            </span>
            <h3 className="mt-4 font-display text-2xl font-extrabold">{q.locationRequiredTitle}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/55">{q.locationRequired}</p>
            <button
              onClick={onRequestLocation}
              className="primary-button mt-5"
            >
              <MapPin size={14} />
              {q.locationCta}
            </button>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div className="grid gap-6">
              <div className="flex items-start gap-3 rounded-2xl border border-leaf/30 bg-leaf/6 px-4 py-3">
                <Navigation size={15} className="mt-0.5 shrink-0 text-leaf" />
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-leaf/70">{q.locationLabel}</p>
                  <p className="mt-1 truncate text-sm font-extrabold text-ink/75">{address}</p>
                  <p className="mt-0.5 text-xs font-semibold text-leaf">{q.locationActive}</p>
                </div>
              </div>

              {q.fields.map(({ key, label, options }) => (
              <div key={key}>
                <p className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-ink/45">{label}</p>
                <div className="flex flex-wrap gap-2">
                  {options.map(({ v, l }) => {
                    const selected = key === "category"
                      ? answers.category.includes(v)
                      : answers[key] === v;

                    return (
                    <button
                      key={v}
                      onClick={() => key === "category" ? toggleCategory(v) : set(key, v)}
                      aria-pressed={selected}
                      className={selected ? "quiz-pill-active" : "quiz-pill"}
                    >
                      {l}
                    </button>
                    );
                  })}
                </div>
              </div>
              ))}
            </div>

            <div>
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf text-white">
                  <Sparkles size={17} />
                </span>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-ink/40">{q.resultsLabel}</p>
                  <p className="text-sm font-extrabold">{q.resultsSubLabel}</p>
                </div>
              </div>

              {canBuildRoute && (
                <div className="mb-4 rounded-2xl border border-coral/25 bg-coral/6 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold text-coral">{q.routeModeTitle}</p>
                      <p className="mt-1 text-xs leading-5 text-ink/55">{q.routeModeHint}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold text-coral">
                      {selectedMalls.length}
                    </span>
                  </div>
                  {selectedMalls.length > 0 && (
                    <div className="mt-3 rounded-xl bg-white/75 px-3 py-2.5">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-coral/70">{q.routeOrderLabel}</p>
                      <ol className="mt-2 grid gap-1.5">
                        {selectedMalls.map((mall, index) => (
                          <li key={mall.id} className="flex items-center gap-2 text-xs font-extrabold text-ink/70">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-coral text-[10px] text-white">
                              {index + 1}
                            </span>
                            <span className="truncate">{mall.name}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {routeAnalysis && (
                    <div className="mt-3 grid gap-2 text-xs">
                      <div className={`rounded-xl px-3 py-2.5 ${routeAnalysis.fitsTime ? "bg-leaf/10 text-leaf" : "bg-gold/15 text-gold"}`}>
                        <p className="font-extrabold">{q.routeTimeLabel}: {routeAnalysis.shoppingTime}</p>
                        <p className="mt-0.5 text-[10px] font-semibold opacity-75">
                          {routeAnalysis.fitsTime ? q.routeFitsTime : q.routeExceedsTime}
                        </p>
                      </div>
                      {selectedMalls.length >= 2 ? (
                        <div className={`rounded-xl px-3 py-2.5 ${routeAnalysis.orderRecommended ? "bg-leaf/10 text-leaf" : "bg-gold/15 text-gold"}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-extrabold">
                                {routeAnalysis.orderRecommended ? q.routeOrderRecommended : q.routeOrderReview}
                              </p>
                              <p className="mt-0.5 text-[10px] font-semibold opacity-75">
                                {routeAnalysis.orderRecommended ? q.routeOrderRecommendedHint : q.routeOrderReviewHint}
                              </p>
                            </div>
                            {!routeAnalysis.orderRecommended && (
                              <button
                                type="button"
                                onClick={applyRecommendedOrder}
                                className="shrink-0 rounded-lg bg-gold px-3 py-1.5 text-[10px] font-extrabold text-white transition hover:bg-gold/90"
                              >
                                {q.routeChangeOrder}
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] font-bold text-coral/75">{q.routeOrderPending}</p>
                      )}
                    </div>
                  )}
                  {routeUrl ? (
                    <a
                      href={routeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-coral px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-coral/90"
                    >
                      <ExternalLink size={14} />
                      {q.routeCta}
                    </a>
                  ) : (
                    <p className="mt-3 text-[11px] font-bold text-coral/75">{q.routeSelectMore}</p>
                  )}
                </div>
              )}

              <div className="grid gap-3">
                {recommendations.map((mall, index) => (
                  <button
                    key={mall.id}
                    onClick={() => canBuildRoute ? toggleRouteMall(mall.id) : onSelect(mall)}
                    aria-pressed={canBuildRoute ? selectedIds.includes(mall.id) : undefined}
                    className={`group rounded-2xl border p-4 text-left transition hover:shadow-card ${
                      canBuildRoute && selectedIds.includes(mall.id)
                        ? "border-coral/50 bg-coral/6 hover:bg-coral/10"
                        : mall.isNearest
                        ? "border-leaf/40 bg-leaf/5 hover:bg-white"
                        : "border-ink/8 bg-[#f8faf6] hover:border-leaf/30 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white ${
                          canBuildRoute && selectedIds.includes(mall.id)
                            ? "bg-coral"
                            : index === 0 ? "bg-leaf" : "bg-ink/25"
                        }`}>
                          {canBuildRoute && selectedIds.includes(mall.id)
                            ? selectedIds.indexOf(mall.id) + 1
                            : index + 1}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-extrabold leading-tight">{mall.name}</p>
                            {mall.isNearest && (
                              <span className="flex items-center gap-1 rounded-full bg-leaf px-2 py-0.5 text-[10px] font-extrabold text-white">
                                <Navigation size={9} /> {q.nearest ?? "Más cercano"}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs font-semibold text-ink/45">
                            {mall.commune} · {mall.recommendedTime}
                            {mall.distanceKm != null && (
                              <span className="ml-2 text-leaf font-bold">· {mall.distanceKm} km</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-extrabold text-white">
                          {mall.recommendationScore}
                        </span>
                        <ArrowRight size={14} className="text-ink/25 transition group-hover:text-leaf" />
                      </div>
                    </div>
                    {mall.reasons?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {mall.reasons.slice(0, 3).map(r => (
                          <span key={r} className="rounded-full border border-ink/10 bg-white px-2.5 py-1 text-xs font-bold text-ink/55">
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default RecommendationQuiz;
