import MallCard from "./MallCard";
import { useLanguage } from "../i18n/LanguageContext";

function MallGrid({ malls, compareIds, onCompare, availableHours }) {
  const { t } = useLanguage();
  const mg = t.mallGrid;

  if (!malls.length) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center">
        <p className="font-extrabold text-ink/40">{mg.empty}</p>
        <p className="mt-1 text-sm text-ink/35">{mg.emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {malls.map(mall => (
        <MallCard
          key={mall.id}
          mall={mall}
          onCompare={onCompare}
          isComparing={compareIds.includes(mall.id)}
          availableHours={availableHours}
        />
      ))}
    </div>
  );
}

export default MallGrid;
