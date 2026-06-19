import { useMemo, useState } from "react";
import { ArrowRight, Navigation, Sparkles } from "lucide-react";
import { getRecommendations } from "../utils/scoring";
import { useLanguage } from "../i18n/LanguageContext";

const initialAnswers = {
  zone: "Providencia",
  category: "ropa",
  time: "3-4 horas",
  transport: "Metro",
  withKids: "No",
  goal: "variedad",
};

function RecommendationQuiz({ malls, onSelect, userCoords }) {
  const [answers, setAnswers] = useState(initialAnswers);
  const { t } = useLanguage();
  const q = t.quiz;

  const recommendations = useMemo(
    () => getRecommendations(malls, answers, userCoords).slice(0, 4),
    [answers, malls, userCoords]
  );

  function set(key, value) {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }

  const zoneField = q.fields.find(f => f.key === "zone");
  const otherFields = q.fields.filter(f => f.key !== "zone");

  return (
    <section id="quiz" className="bg-white">
      <div className="section-shell">
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow">{q.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight">{q.title}</h2>
          <p className="mt-3 text-sm leading-6 text-ink/55">{q.subtitle}</p>
        </div>

        {userCoords && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-leaf/30 bg-leaf/6 px-4 py-3">
            <Navigation size={14} className="shrink-0 text-leaf" />
            <p className="text-xs font-extrabold text-leaf">{q.locationActive}</p>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div className="grid gap-6">
            {zoneField && (
              <div>
                <p className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-ink/45">{zoneField.label}</p>
                <div className="flex flex-wrap gap-2">
                  {zoneField.options.map(({ v, l }) => (
                    <button
                      key={v}
                      onClick={() => set("zone", v)}
                      className={answers.zone === v && !userCoords ? "quiz-pill-active" : "quiz-pill"}
                      disabled={!!userCoords}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                {userCoords && (
                  <p className="mt-2 text-xs text-ink/40 font-medium">
                    {q.zonePillsDisabled ?? "Zona automática según tu ubicación ingresada arriba"}
                  </p>
                )}
              </div>
            )}

            {otherFields.map(({ key, label, options }) => (
              <div key={key}>
                <p className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-ink/45">{label}</p>
                <div className="flex flex-wrap gap-2">
                  {options.map(({ v, l }) => (
                    <button
                      key={v}
                      onClick={() => set(key, v)}
                      className={answers[key] === v ? "quiz-pill-active" : "quiz-pill"}
                    >
                      {l}
                    </button>
                  ))}
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

            <div className="grid gap-3">
              {recommendations.map((mall, index) => (
                <button
                  key={mall.id}
                  onClick={() => onSelect(mall)}
                  className={`group rounded-2xl border p-4 text-left transition hover:shadow-card ${
                    mall.isNearest
                      ? "border-leaf/40 bg-leaf/5 hover:bg-white"
                      : "border-ink/8 bg-[#f8faf6] hover:border-leaf/30 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white ${
                        index === 0 ? "bg-leaf" : "bg-ink/25"
                      }`}>
                        {index + 1}
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
      </div>
    </section>
  );
}

export default RecommendationQuiz;
