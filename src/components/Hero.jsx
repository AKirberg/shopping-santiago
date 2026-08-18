import { ArrowRight } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import TrustStrip from "./TrustStrip";

function Hero({ onIntent }) {
  const { t } = useLanguage();
  const h = t.hero;

  return (
    <section id="inicio" className="relative overflow-hidden text-white">

      {/* ── Layer 1: duotone image (grayscale + green bg-blend) ── */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/hero-mall.png')",
          backgroundColor: "#15803d",
          backgroundBlendMode: "luminosity",
          filter: "grayscale(100%) contrast(1.25) brightness(0.85)",
        }}
      />

      {/* ── Layer 2: bold green color wash — gives the POP tint ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "rgba(21, 128, 61, 0.42)" }}
      />

      {/* ── Layer 3: halftone dot grid ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.28) 1.5px, transparent 1.5px)",
          backgroundSize: "13px 13px",
        }}
      />

      {/* ── Layer 4: dark gradient for text contrast (left → right) ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.48) 38%, rgba(0,0,0,0.14) 65%, transparent 100%)",
        }}
      />

      {/* ── Content ── */}
      <div className="section-shell relative py-12 lg:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.26em] text-white/55">
            {h.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-5xl font-extrabold leading-[1.0] drop-shadow-sm sm:text-6xl lg:text-7xl">
            {h.title}
          </h1>
          <p className="mt-4 text-base font-medium leading-7 text-white/80 drop-shadow-sm sm:text-lg">
            {h.subtitle}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href="#quiz"
              className="primary-button bg-white text-ink hover:bg-leaf hover:text-white border-transparent"
            >
              {h.primaryAction} <ArrowRight size={16} />
            </a>
            <a
              href="#rutas"
              className="secondary-button border-white/35 bg-white/10 text-white hover:border-white/60 hover:bg-white/20 backdrop-blur-sm"
            >
              {h.secondaryAction}
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2">
            {[
              { emoji: "✅", label: h.trust.free },
              { emoji: "🔓", label: h.trust.noReg },
              { emoji: "🚫", label: h.trust.noAds },
            ].map(({ emoji, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
                <span className="text-sm leading-none">{emoji}</span>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
