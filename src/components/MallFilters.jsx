import { RotateCcw, Search } from "lucide-react";

const toggleFilters = [
  ["outlet", "Outlet"],
  ["premium", "Premium"],
  ["family", "Familiar"],
  ["metro", "Con metro"],
  ["food", "Buena comida"],
  ["quick", "Rapido"],
  ["tourist", "Turistico"]
];

function MallFilters({ filters, setFilters, malls }) {
  const communes = ["Todas", ...new Set(malls.map((mall) => mall.commune))];
  const categories = ["Todas", ...new Set(malls.flatMap((mall) => mall.categories))].sort();

  return (
    <div className="rounded-[2rem] border border-ink/10 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
        <label className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" size={18} />
          <input
            className="control pl-11"
            placeholder="Buscar por mall, comuna o categoria"
            value={filters.query}
            onChange={(event) => setFilters({ ...filters, query: event.target.value })}
          />
        </label>
        <select className="control" value={filters.commune} onChange={(event) => setFilters({ ...filters, commune: event.target.value })}>
          {communes.map((commune) => <option key={commune}>{commune}</option>)}
        </select>
        <select className="control" value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
          {categories.map((category) => <option key={category}>{category}</option>)}
        </select>
        <button
          className="icon-button h-12 w-12"
          onClick={() => setFilters({ query: "", commune: "Todas", category: "Todas", outlet: false, premium: false, family: false, metro: false, food: false, quick: false, tourist: false })}
          aria-label="Limpiar filtros"
        >
          <RotateCcw size={18} />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {toggleFilters.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilters({ ...filters, [key]: !filters[key] })}
            className={`rounded-full border px-4 py-2 text-xs font-extrabold transition ${
              filters[key]
                ? "border-leaf bg-leaf text-white"
                : "border-ink/10 bg-[#f8faf6] text-ink/70 hover:border-leaf/40"
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
