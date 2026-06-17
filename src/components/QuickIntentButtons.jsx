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
    <section className="border-b border-ink/10 bg-white">
      <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 py-5 sm:px-6 lg:px-8">
        {intents.map(({ label, key, icon: Icon }) => (
          <button key={key} onClick={() => onIntent(key)} className="secondary-button whitespace-nowrap">
            <Icon size={17} /> {label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default QuickIntentButtons;
