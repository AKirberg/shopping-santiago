import { useMemo, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { getRecommendations } from "../utils/scoring";

const initialAnswers = {
  zone: "Providencia",
  category: "ropa",
  time: "3-4 horas",
  transport: "Metro",
  withKids: "No",
  goal: "variedad"
};

const fields = [
  {
    key: "zone",
    label: "¿Dónde estás?",
    options: ["Providencia", "Las Condes", "Vitacura", "Santiago Centro", "Aeropuerto", "Otra"]
  },
  {
    key: "category",
    label: "¿Qué buscas comprar?",
    options: ["ropa", "zapatillas", "tecnología", "lujo", "deporte", "supermercado", "regalos", "outlet"]
  },
  {
    key: "time",
    label: "¿Cuánto tiempo tienes?",
    options: ["1-2 horas", "3-4 horas", "medio día", "día completo"]
  },
  {
    key: "transport",
    label: "¿Cómo te mueves?",
    options: ["Metro", "Uber/Taxi", "Auto"]
  },
  {
    key: "withKids",
    label: "¿Viajas con niños?",
    options: ["No", "Sí"]
  },
  {
    key: "goal",
    label: "¿Qué priorizas?",
    options: ["variedad", "Mejor precio", "Mejor experiencia", "Marcas premium", "rapidez"]
  }
];

function RecommendationQuiz({ malls, onSelect }) {
  const [answers, setAnswers] = useState(initialAnswers);
  const recommendations = useMemo(() => getRecommendations(malls, answers).slice(0, 4), [answers, malls]);

  function set(key, value) {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }

  return (
    <section id="quiz" className="bg-white">
      <div className="section-shell">
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow">Recomendador</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight">¿Qué mall me conviene?</h2>
          <p className="mt-3 text-sm leading-6 text-ink/55">
            Selecciona tus preferencias y el sistema ordena los malls según zona, transporte, tiempo y tipo de compra.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div className="grid gap-6">
            {fields.map(({ key, label, options }) => (
              <div key={key}>
                <p className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-ink/45">{label}</p>
                <div className="flex flex-wrap gap-2">
                  {options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => set(key, opt)}
                      className={answers[key] === opt ? "quiz-pill-active" : "quiz-pill"}
                    >
                      {opt}
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
                <p className="text-xs font-extrabold uppercase tracking-wider text-ink/40">Resultados</p>
                <p className="text-sm font-extrabold">Ordenados por compatibilidad</p>
              </div>
            </div>

            <div className="grid gap-3">
              {recommendations.map((mall, index) => (
                <button
                  key={mall.id}
                  onClick={() => onSelect(mall)}
                  className="group rounded-2xl border border-ink/8 bg-[#f8faf6] p-4 text-left transition hover:border-leaf/30 hover:bg-white hover:shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white ${
                        index === 0 ? "bg-leaf" : "bg-ink/25"
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-extrabold leading-tight">{mall.name}</p>
                        <p className="mt-0.5 text-xs font-semibold text-ink/45">{mall.commune} · {mall.recommendedTime}</p>
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
