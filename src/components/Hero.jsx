import { ArrowRight, Clock, Compass, MapPinned } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

function Hero({ onIntent, mallCount = 0, routeCount = 0 }) {
  const { t } = useLanguage();
  const h = t.hero;

  const stats = [
    { icon: Compass, value: String(mallCount), label: h.statMalls, color: "text-coral" },
    { icon: MapPinned, value: String(routeCount), label: h.statRoutes, color: "text-leaf" },
    { icon: Clock, value: "3h", label: h.statMode, color: "text-gold" },
  ];

  return (
    <section id="inicio" className="relative overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_50%,rgba(227,107,69,0.22),transparent_45%),radial-gradient(ellipse_at_85%_20%,rgba(18,97,91,0.30),transparent_50%)]" />
      <div className="section-shell relative py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-white/50">{h.eyebrow}</p>
            <h1 className="mt-4 font-display text-5xl font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl">
              {h.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-white/60 sm:text-lg">
              {h.subtitle}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#quiz" className="primary-button bg-white text-ink hover:bg-coral hover:text-white">
                {h.primaryAction} <ArrowRight size={16} />
              </a>
              <a href="#rutas" className="secondary-button border-white/20 bg-white/8 text-white hover:border-white/35 hover:bg-white/15 hover:text-white">
                {h.secondaryAction}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:w-36">
            {stats.map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                <Icon size={16} className={`${color} opacity-90`} />
                <p className="mt-2.5 text-2xl font-extrabold">{value}</p>
                <p className="mt-0.5 text-xs font-bold text-white/45">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
