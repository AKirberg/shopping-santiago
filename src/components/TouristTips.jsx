import { AlertTriangle, Clock, CreditCard, FileCheck2, Shield, TrainFront } from "lucide-react";

const tips = [
  { icon: Clock, title: "Evita horas punta", text: "Si usas auto, planifica traslados fuera de los momentos de mayor flujo." },
  { icon: FileCheck2, title: "Confirma horarios", text: "Revisa siempre canales oficiales antes de ir, especialmente en feriados." },
  { icon: TrainFront, title: "Usa metro cuando convenga", text: "Para zonas bien conectadas, puede ser mas rapido que depender del trafico." },
  { icon: CreditCard, title: "Outlets mas alejados", text: "Considera Uber/Taxi o auto para rutas de descuento fuera del eje central." },
  { icon: AlertTriangle, title: "Cambios e impuestos", text: "Consulta devoluciones, cambios e impuestos directamente en cada tienda." },
  { icon: Shield, title: "Documentos y pertenencias", text: "Cuida tus objetos en zonas de alto flujo y lleva documento si una tienda lo solicita." }
];

function TouristTips() {
  return (
    <section id="consejos" className="bg-ink text-white">
      <div className="section-shell">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-coral">Antes de salir</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold">Consejos para turistas</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tips.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
              <Icon className="text-coral" />
              <h3 className="mt-5 text-xl font-extrabold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TouristTips;
