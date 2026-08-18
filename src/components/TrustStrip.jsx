import { useLanguage } from "../i18n/LanguageContext";

export default function TrustStrip() {
  const { t } = useLanguage();
  const trust = t.hero.trust;

  const items = [
    { emoji: "✅", label: trust.free },
    { emoji: "🔓", label: trust.noReg },
    { emoji: "🚫", label: trust.noAds },
  ];

  return (
    <div className="border-b border-ink/8 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5">
          {items.map(({ emoji, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 text-xs font-semibold text-ink/50"
            >
              <span className="text-sm leading-none">{emoji}</span>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
