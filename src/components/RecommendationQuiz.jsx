import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
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
  ["zone", "Zona donde estoy", ["Providencia", "Las Condes", "Vitacura", "Santiago Centro", "Aeropuerto", "Otra"]],
  ["category", "Que quiero comprar", ["ropa", "zapatillas", "tecnologia", "lujo", "deporte", "supermercado/farmacia", "regalos", "outlet"]],
  ["time", "Tiempo disponible", ["1-2 horas", "3-4 horas", "medio dia", "dia completo"]],
  ["transport", "Transporte", ["Metro", "Uber/Taxi", "Auto"]],
  ["withKids", "Viajo con niños", ["Si", "No"]],
  ["goal", "Busco", ["Mejor precio", "Mejor experiencia", "Marcas premium", "variedad", "rapidez"]]
];

function RecommendationQuiz({ malls, onSelect }) {
  const [answers, setAnswers] = useState(initialAnswers);
  const recommendations = useMemo(() => getRecommendations(malls, answers).slice(0, 4), [answers, malls]);

  return (
    <section id="quiz" className="bg-white">
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow">Recomendador</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight">Que mall me conviene?</h2>
            <p className="mt-4 text-ink/65">
              Un scoring simple ordena las opciones segun compras, zona, transporte, tiempo, niños y tipo de experiencia.
            </p>
            <div className="mt-6 grid gap-4">
              {fields.map(([key, label, options]) => (
                <label key={key} className="grid gap-2">
                  <span className="text-sm font-extrabold text-ink/60">{label}</span>
                  <select className="control" value={answers[key]} onChange={(event) => setAnswers({ ...answers, [key]: event.target.value })}>
                    {options.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] bg-mist p-4 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-leaf text-white">
                <Sparkles size={20} />
              </span>
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-ink/45">Resultados</p>
                <p className="font-extrabold">Ordenados por puntaje</p>
              </div>
            </div>
            <div className="grid gap-3">
              {recommendations.map((mall, index) => (
                <button key={mall.id} onClick={() => onSelect(mall)} className="rounded-[1.5rem] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold text-coral">#{index + 1} recomendado</p>
                      <h3 className="mt-1 text-xl font-extrabold">{mall.name}</h3>
                      <p className="mt-1 text-sm font-bold text-ink/50">{mall.commune} · {mall.recommendedTime}</p>
                    </div>
                    <span className="rounded-full bg-ink px-3 py-1 text-sm font-extrabold text-white">{mall.recommendationScore}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(mall.reasons.length ? mall.reasons : ["Buen puntaje turistico"]).map((reason) => <span key={reason} className="tag">{reason}</span>)}
                  </div>
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
