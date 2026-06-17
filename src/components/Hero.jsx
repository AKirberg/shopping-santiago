import { ArrowRight, Clock, Compass, MapPinned } from "lucide-react";
import { defaultLocale, locales } from "../i18n/locales";

const intentChips = [
  ["Quiero ropa", "ropa"],
  ["Busco outlet", "outlet"],
  ["Cerca de Providencia", "providencia"],
  ["Voy con niños", "kids"],
  ["Marcas premium", "premium"],
  ["Solo 3 horas", "quick"]
];

function Hero({ onIntent, mallCount = 0, routeCount = 0 }) {
  const copy = locales[defaultLocale].hero;

  const stats = [
    { icon: Compass, value: String(mallCount), label: "malls", color: "text-coral" },
    { icon: MapPinned, value: String(routeCount), label: "rutas", color: "text-leaf" },
    { icon: Clock, value: "3h", label: "modo rápido", color: "text-gold" }
  ];

  return (
    <section id="inicio" className="relative overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_50%,rgba(227,107,69,0.22),transparent_45%),radial-gradient(ellipse_at_85%_20%,rgba(18,97,91,0.30),transparent_50%)]" />
      <div className="section-shell relative py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-white/50">{copy.eyebrow}</p>
            <h1 className="mt-4 font-display text-5xl font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/65 sm:text-lg">
              {copy.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#quiz" className="primary-button bg-white text-ink hover:bg-coral hover:text-white">
                {copy.primaryAction} <ArrowRight size={16} />
              </a>
              <a href="#rutas" className="secondary-button border-white/20 bg-white/8 text-white hover:border-white/35 hover:bg-white/15 hover:text-white">
                {copy.secondaryAction}
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-3 gap-3">
              {stats.map(({ icon: Icon, value, label, color }) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                  <Icon size={18} className={`${color} opacity-90`} />
                  <p className="mt-3 text-2xl font-extrabold">{value}</p>
                  <p className="mt-0.5 text-xs font-bold text-white/50">{label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {intentChips.map(([label, intent]) => (
                <button
                  key={intent}
                  onClick={() => onIntent(intent)}
                  className="rounded-xl border border-white/12 bg-white/7 px-4 py-3 text-left text-sm font-bold text-white/80 transition hover:border-white/25 hover:bg-white/12 hover:text-white"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
