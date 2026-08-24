import { useState } from "react";
import { AlertTriangle, ChevronDown, Clock, CreditCard, FileCheck2, Lightbulb, Shield, TrainFront } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

const icons = [Clock, FileCheck2, TrainFront, CreditCard, AlertTriangle, Shield];

function TouristTips() {
  const { t } = useLanguage();
  const tips = t.tips;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section id="consejos" className="bg-ink text-white">
      <div className={`section-shell ${isExpanded ? "" : "!py-5 lg:!py-6"}`}>
        <button
          type="button"
          onClick={() => setIsExpanded((previous) => !previous)}
          aria-expanded={isExpanded}
          className="group w-full rounded-3xl border border-white/10 bg-white/7 px-5 py-4 text-left shadow-sm transition hover:border-coral/45 hover:bg-white/10 sm:px-6 sm:py-5"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-coral/15 text-coral">
              <Lightbulb size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-coral">{tips.eyebrow}</p>
              <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight sm:text-3xl">{tips.title}</h2>
              <p className="mt-1 line-clamp-1 max-w-3xl text-sm text-white/50">{tips.subtitle}</p>
            </div>
            <span className="flex shrink-0 items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-extrabold text-ink transition group-hover:bg-coral group-hover:text-white sm:px-4">
              <span className="hidden sm:inline">{isExpanded ? tips.collapseCta : tips.expandCta}</span>
              <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
            </span>
          </div>
        </button>

        {isExpanded && (
          <div className="mt-6 grid animate-[fadeIn_300ms_ease-out] gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tips.items.map(({ title, text }, i) => {
              const Icon = icons[i];
              return (
                <article key={title} className="rounded-2xl border border-white/8 bg-white/7 p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <Icon size={17} className="text-coral" />
                  </span>
                  <h3 className="mt-4 font-extrabold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">{text}</p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default TouristTips;
