import { Check, X } from "lucide-react";

const rows = [
  ["Experiencia", m => m.type.slice(0, 2).join(", ")],
  ["Mejor para", m => m.bestFor.slice(0, 2).join(", ")],
  ["Transporte", m => m.type.includes("metro") ? m.transport.metro : "Auto o Uber/Taxi"],
  ["Tiempo sugerido", m => m.recommendedTime],
  ["Nivel de precios", m => m.priceLevel],
  ["Familiar", m => m.familyFriendly],
  ["Outlet", m => m.outlet],
  ["Premium", m => m.premium],
  ["Buena comida", m => m.foodExperience],
  ["Score turístico", m => `${m.touristScore}/10`]
];

function CompareMalls({ malls, selectedIds, setSelectedIds }) {
  const selected = selectedIds.map(id => malls.find(m => m.id === id)).filter(Boolean);

  function updateSlot(index, value) {
    const next = [...selectedIds];
    next[index] = value || undefined;
    setSelectedIds([...new Set(next.filter(Boolean))].slice(0, 3));
  }

  return (
    <section id="comparar" className="bg-white">
      <div className="section-shell">
        <div className="mb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Decisión rápida</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold">Comparador</h2>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {[0, 1, 2].map(slot => (
                <select
                  key={slot}
                  className="control sm:w-44"
                  value={selectedIds[slot] || ""}
                  onChange={e => updateSlot(slot, e.target.value)}
                >
                  <option value="">+ Agregar mall</option>
                  {malls.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              ))}
            </div>
          </div>
        </div>

        {selected.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/15 bg-[#f8faf6] p-10 text-center">
            <p className="font-extrabold text-ink/40">Selecciona 2 o 3 malls para comparar</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-ink/8">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="bg-ink text-white">
                  <th className="sticky left-0 bg-ink px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-white/60 w-36">
                    Criterio
                  </th>
                  {selected.map(m => (
                    <th key={m.id} className="px-5 py-4 text-left font-extrabold">{m.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, getter], ri) => (
                  <tr key={label} className={ri % 2 === 0 ? "bg-white" : "bg-[#f8faf6]"}>
                    <td className="sticky left-0 px-5 py-3.5 text-xs font-extrabold uppercase tracking-wider text-ink/45 w-36"
                        style={{ background: ri % 2 === 0 ? "#ffffff" : "#f8faf6" }}>
                      {label}
                    </td>
                    {selected.map(m => {
                      const val = getter(m);
                      return (
                        <td key={m.id} className="px-5 py-3.5 font-semibold text-ink/70 leading-relaxed">
                          {typeof val === "boolean" ? (
                            val
                              ? <span className="inline-flex items-center gap-1 text-leaf font-extrabold"><Check size={15} /> Sí</span>
                              : <span className="inline-flex items-center gap-1 text-ink/30 font-bold"><X size={15} /> No</span>
                          ) : val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default CompareMalls;
