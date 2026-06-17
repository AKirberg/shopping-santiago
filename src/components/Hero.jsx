import { ArrowRight, Clock, Compass, MapPinned } from "lucide-react";
import { defaultLocale, locales } from "../i18n/locales";

function Hero({ onIntent, mallCount = 0, routeCount = 0 }) {
  const copy = locales[defaultLocale].hero;

  return (
    <section id="inicio" className="relative overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(227,107,69,0.28),transparent_32%),linear-gradient(135deg,rgba(18,97,91,0.85),rgba(31,49,68,0.35))]" />
      <div className="section-shell relative grid min-h-[640px] gap-10 py-10 sm:min-h-[680px] sm:py-12 lg:min-h-[700px] lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-14 xl:min-h-[720px]">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/65">{copy.eyebrow}</p>
          <h1 className="mt-5 max-w-4xl font-display text-6xl font-extrabold leading-[0.95] sm:text-7xl lg:text-8xl">
            {copy.title}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/78 sm:text-xl">
            {copy.subtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#quiz" className="primary-button bg-white text-ink hover:bg-coral hover:text-white">
              {copy.primaryAction} <ArrowRight size={18} />
            </a>
            <a href="#rutas" className="secondary-button border-white/20 bg-white/10 text-white hover:border-white/40 hover:text-white">
              {copy.secondaryAction}
            </a>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-soft backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] bg-white p-5 text-ink">
                <Compass className="text-coral" />
                <p className="mt-5 text-3xl font-extrabold">{mallCount}</p>
                <p className="text-sm font-bold text-ink/55">malls cargados</p>
              </div>
              <div className="rounded-[1.5rem] bg-white p-5 text-ink">
                <MapPinned className="text-leaf" />
                <p className="mt-5 text-3xl font-extrabold">{routeCount}</p>
                <p className="text-sm font-bold text-ink/55">rutas editables</p>
              </div>
              <div className="rounded-[1.5rem] bg-white p-5 text-ink">
                <Clock className="text-gold" />
                <p className="mt-5 text-3xl font-extrabold">3h</p>
                <p className="text-sm font-bold text-ink/55">modo rapido</p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Quiero comprar ropa", "ropa"],
              ["Busco outlet", "outlet"],
              ["Estoy cerca de Providencia", "providencia"],
              ["Voy con niños", "kids"],
              ["Quiero marcas premium", "premium"],
              ["Tengo solo 3 horas", "quick"]
            ].map(([label, intent]) => (
              <button
                key={intent}
                onClick={() => onIntent(intent)}
                className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-left text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-ink"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
