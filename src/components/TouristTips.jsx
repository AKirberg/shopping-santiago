import { AlertTriangle, Clock, CreditCard, FileCheck2, Shield, TrainFront } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

const icons = [Clock, FileCheck2, TrainFront, CreditCard, AlertTriangle, Shield];

function TouristTips() {
  const { t } = useLanguage();
  const tips = t.tips;

  return (
    <section id="consejos" className="bg-ink text-white">
      <div className="section-shell">
        <div className="mb-10 max-w-xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-coral">{tips.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold">{tips.title}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </section>
  );
}

export default TouristTips;
