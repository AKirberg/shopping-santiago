import { Check, X } from "lucide-react";

const rows = [
  ["Tipo de experiencia", (mall) => mall.type.slice(0, 3).join(", ")],
  ["Mejor para", (mall) => mall.bestFor.join(", ")],
  ["Transporte", (mall) => mall.type.includes("metro") ? mall.transport.metro : "Mejor con auto o Uber/Taxi"],
  ["Tiempo recomendado", (mall) => mall.recommendedTime],
  ["Nivel de precios", (mall) => mall.priceLevel],
  ["Ideal para familias", (mall) => mall.familyFriendly],
  ["Outlet", (mall) => mall.outlet],
  ["Premium", (mall) => mall.premium],
  ["Comida", (mall) => mall.foodExperience],
  ["Puntaje turistico", (mall) => `${mall.touristScore}/10`]
];

function CompareMalls({ malls, selectedIds, setSelectedIds }) {
  const selected = selectedIds.map((id) => malls.find((mall) => mall.id === id)).filter(Boolean);

  function updateSlot(index, value) {
    const next = [...selectedIds];
    next[index] = value || undefined;
    setSelectedIds([...new Set(next.filter(Boolean))].slice(0, 3));
  }

  return (
    <section id="comparar" className="bg-white">
      <div className="section-shell">
        <div className="mb-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="eyebrow">Decision rapida</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold">Comparador de malls</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((slot) => (
              <select key={slot} className="control" value={selectedIds[slot] || ""} onChange={(event) => updateSlot(slot, event.target.value)}>
                <option value="">Elegir mall</option>
                {malls.map((mall) => <option key={mall.id} value={mall.id}>{mall.name}</option>)}
              </select>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto rounded-[2rem] border border-ink/10 bg-[#f8faf6]">
          <div className="grid min-w-[720px]" style={{ gridTemplateColumns: `220px repeat(${Math.max(selected.length, 1)}, minmax(160px,1fr))` }}>
            <div className="bg-ink p-4 text-sm font-extrabold text-white">Criterio</div>
            {selected.length ? (
              selected.map((mall) => <div key={mall.id} className="bg-ink p-4 text-sm font-extrabold text-white">{mall.name}</div>)
            ) : (
              <div className="bg-ink p-4 text-sm font-extrabold text-white">Elige un mall</div>
            )}
            {rows.map(([label, getter]) => (
              <Row key={label} label={label} selected={selected} getter={getter} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, selected, getter }) {
  return (
    <>
      <div className="border-t border-ink/10 bg-white p-4 text-sm font-extrabold text-ink/60">{label}</div>
      {selected.length ? selected.map((mall) => {
        const value = getter(mall);
        return (
          <div key={`${label}-${mall.id}`} className="border-t border-ink/10 p-4 text-sm font-bold leading-6 text-ink/70">
            {typeof value === "boolean" ? (
              value ? <Check className="text-leaf" size={20} /> : <X className="text-coral" size={20} />
            ) : value}
          </div>
        );
      }) : (
        <div className="border-t border-ink/10 p-4 text-sm font-bold leading-6 text-ink/45">
          Selecciona 2 o 3 opciones para comparar.
        </div>
      )}
    </>
  );
}

export default CompareMalls;
