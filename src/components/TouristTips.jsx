import { AlertTriangle, Clock, CreditCard, FileCheck2, Shield, TrainFront } from "lucide-react";

const tips = [
  { icon: Clock, title: "Evita horas punta", text: "Si usas auto, planifica traslados fuera del horario de mayor flujo vehicular." },
  { icon: FileCheck2, title: "Confirma horarios", text: "Revisa canales oficiales antes de ir, especialmente en feriados nacionales." },
  { icon: TrainFront, title: "Usa el metro", text: "Para zonas bien conectadas puede ser más rápido que depender del tráfico." },
  { icon: CreditCard, title: "Outlets más alejados", text: "Considera Uber o auto para rutas de descuento fuera del eje central de la ciudad." },
  { icon: AlertTriangle, title: "Cambios e impuestos", text: "Consulta políticas de devolución e impuestos directamente en cada tienda." },
  { icon: Shield, title: "Documentos y pertenencias", text: "Cuida tus objetos en zonas de alto flujo. Lleva documento si una tienda lo solicita." }
];

function TouristTips() {
  return (
    <section id="consejos" className="bg-ink text-white">
      <div className="section-shell">
        <div className="mb-10 max-w-xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-coral">Antes de salir</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold">Consejos para turistas</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tips.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-white/8 bg-white/7 p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                <Icon size={17} className="text-coral" />
              </span>
              <h3 className="mt-4 font-extrabold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TouristTips;
