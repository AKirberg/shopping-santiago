import { ArrowRight } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

function Hero({ onIntent }) {
  const { t } = useLanguage();
  const h = t.hero;

  return (
    <section id="inicio" className="relative overflow-hidden bg-mist text-ink">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-mall.png')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-white/30" />
      <div className="section-shell relative py-12 lg:py-16">
        <div className="grid gap-10">
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
        </div>
      </div>
    </section>
  );
}

export default Hero;
