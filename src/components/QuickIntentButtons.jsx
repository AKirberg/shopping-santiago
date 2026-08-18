import { Baby, BadgePercent, Clock3, Gem, PlaneLanding, Shirt, UtensilsCrossed } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

const intentKeys = [
  { key: "ropa",    icon: Shirt },
  { key: "outlet",  icon: BadgePercent },
  { key: "comer",   icon: UtensilsCrossed },
  { key: "kids",    icon: Baby },
  { key: "premium", icon: Gem },
  { key: "quick",   icon: Clock3 },
];

function QuickIntentButtons({ onIntent, onLastMinute }) {
  const { t } = useLanguage();
  const items = t.quickIntents.items;

  return (
    <section className="border-b border-ink/8 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3.5 sm:px-6 lg:px-8">
        <span className="mr-1 shrink-0 text-xs font-extrabold uppercase tracking-wider text-ink/35">
          {t.quickIntents.label}
        </span>
        {intentKeys.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onIntent(key)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-ink/12 bg-[#f8faf6] px-3.5 py-2 text-xs font-bold text-ink/65 transition hover:border-leaf/40 hover:bg-mist hover:text-leaf"
          >
            <Icon size={13} />
            {items[key]}
          </button>
        ))}

        {/* Último minuto — chip especial coral con subtítulo */}
        <button
          onClick={onLastMinute}
          className="flex shrink-0 items-center gap-2 rounded-2xl border border-coral/30 bg-coral/6 px-3.5 py-2 text-left transition hover:bg-coral hover:text-white hover:border-coral group"
        >
          <PlaneLanding size={14} className="shrink-0 text-coral group-hover:text-white" />
          <span className="flex flex-col leading-tight">
            <span className="text-xs font-extrabold text-coral group-hover:text-white">{items.lastMinute}</span>
            <span className="text-[10px] font-semibold text-coral/60 group-hover:text-white/70">{items.lastMinuteSub}</span>
          </span>
        </button>
      </div>
    </section>
  );
}

export default QuickIntentButtons;
