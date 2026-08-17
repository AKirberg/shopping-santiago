import { RotateCcw } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

const toggleKeys = ["outlet", "premium", "family", "metro", "food", "gastronomico", "quick", "tourist"];
const defaultFilters = { query: "", commune: "Todas", category: "Todas", outlet: false, premium: false, family: false, metro: false, food: false, gastronomico: false, quick: false, tourist: false };

function MallFilters({ filters, setFilters, malls }) {
  const { t } = useLanguage();
  const f = t.filters;
  const communes = [f.all, ...new Set(malls.map(m => m.commune))];
  const categories = [f.all, ...new Set(malls.flatMap(m => m.categories))].sort();

  return (
    <div className="rounded-2xl border border-ink/8 bg-white p-4 shadow-card">
      <div className="grid gap-2.5 md:grid-cols-[1fr_0.6fr_0.6fr_auto]">
        <input
          className="control text-sm"
          placeholder={f.placeholder}
          value={filters.query}
          onChange={e => setFilters({ ...filters, query: e.target.value })}
        />
        <select className="control text-sm" value={filters.commune} onChange={e => setFilters({ ...filters, commune: e.target.value })}>
          {communes.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="control text-sm" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <button
          className="icon-button h-[46px] w-[46px]"
          onClick={() => setFilters(defaultFilters)}
          aria-label={f.clearLabel}
          title={f.clearLabel}
        >
          <RotateCcw size={16} />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {toggleKeys.map(key => (
          <button
            key={key}
            onClick={() => setFilters({ ...filters, [key]: !filters[key] })}
            className={`rounded-full border px-4 py-2.5 text-xs font-bold transition ${
              filters[key]
                ? "border-leaf bg-leaf text-white"
                : "border-ink/10 bg-[#f8faf6] text-ink/60 hover:border-leaf/30 hover:text-ink"
            }`}
          >
            {f.toggles[key]}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MallFilters;
