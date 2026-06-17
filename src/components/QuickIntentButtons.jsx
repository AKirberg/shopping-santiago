import { Baby, BadgePercent, Clock3, Gem, MapPin, Shirt } from "lucide-react";

const intents = [
  { label: "Ropa", key: "ropa", icon: Shirt },
  { label: "Outlet", key: "outlet", icon: BadgePercent },
  { label: "Providencia", key: "providencia", icon: MapPin },
  { label: "Con niños", key: "kids", icon: Baby },
  { label: "Premium", key: "premium", icon: Gem },
  { label: "3 horas", key: "quick", icon: Clock3 }
];

function QuickIntentButtons({ onIntent }) {
  return (
    <section className="border-b border-ink/8 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3.5 sm:px-6 lg:px-8">
        <span className="shrink-0 text-xs font-extrabold uppercase tracking-wider text-ink/35 mr-1">Busco:</span>
        {intents.map(({ label, key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onIntent(key)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-ink/12 bg-[#f8faf6] px-3.5 py-2 text-xs font-bold text-ink/65 transition hover:border-leaf/40 hover:bg-mist hover:text-leaf"
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default QuickIntentButtons;
