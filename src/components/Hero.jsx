import { ArrowRight, Compass, Gift, MapPinned } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

function Hero({ onIntent, mallCount = 0, routeCount = 0 }) {
  const { t } = useLanguage();
  const h = t.hero;

  const stats = [
    { icon: Compass, value: String(mallCount), label: h.statMalls, color: "text-coral" },
    { icon: MapPinned, value: String(routeCount), label: h.statRoutes, color: "text-leaf" },
    { icon: Gift, value: "100%", label: h.statMode, color: "text-gold" },
  ];

  return (
    <section id="inicio" className="relative overflow-hidden bg-mist text-ink">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-mall.png')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-white/30" />
      <div className="section-shell relative py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink/50">{h.eyebrow}</p>
            <h1 className="mt-4 font-display text-5xl font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl">
              {h.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-ink/65 sm:text-lg">
              {h.subtitle}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#quiz" className="primary-button bg-ink text-white hover:bg-coral hover:text-white">
                {h.primaryAction} <ArrowRight size={16} />
              </a>
              <a href="#rutas" className="secondary-button border-ink/20 bg-white/60 text-ink hover:border-ink/40 hover:bg-white/80">
                {h.secondaryAction}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:w-36">
            {stats.map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="rounded-2xl border border-ink/10 bg-white/60 p-4 backdrop-blur-sm">
                <Icon size={16} className={`${color} opacity-90`} />
                <p className="mt-2.5 text-2xl font-extrabold text-ink">{value}</p>
                <p className="mt-0.5 text-xs font-bold text-ink/50">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
