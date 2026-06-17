import { RotateCcw, Search } from "lucide-react";

const toggleFilters = [
  ["outlet", "Outlet"],
  ["premium", "Premium"],
  ["family", "Familiar"],
  ["metro", "Con metro"],
  ["food", "Buena comida"],
  ["quick", "Rápido"],
  ["tourist", "Turístico"]
];

const defaultFilters = { query: "", commune: "Todas", category: "Todas", outlet: false, premium: false, family: false, metro: false, food: false, quick: false, tourist: false };

function MallFilters({ filters, setFilters, malls }) {
  const communes = ["Todas", ...new Set(malls.map(m => m.commune))];
  const categories = ["Todas", ...new Set(malls.flatMap(m => m.categories))].sort();

  return (
    <div className="rounded-2xl border border-ink/8 bg-white p-4 shadow-card">
      <div className="grid gap-2.5 md:grid-cols-[1fr_0.6fr_0.6fr_auto]">
        <label className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30" size={16} />
          <input
            className="control pl-10 text-sm"
            placeholder="Buscar mall, comuna..."
            value={filters.query}
            onChange={e => setFilters({ ...filters, query: e.target.value })}
          />
        </label>
        <select className="control text-sm" value={filters.commune} onChange={e => setFilters({ ...filters, commune: e.target.value })}>
          {communes.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="control text-sm" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <button
          className="icon-button h-[46px] w-[46px]"
          onClick={() => setFilters(defaultFilters)}
          aria-label="Limpiar filtros"
          title="Limpiar filtros"
        >
          <RotateCcw size={16} />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {toggleFilters.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilters({ ...filters, [key]: !filters[key] })}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
              filters[key]
                ? "border-leaf bg-leaf text-white"
                : "border-ink/10 bg-[#f8faf6] text-ink/60 hover:border-leaf/30 hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MallFilters;
