import { useState } from "react";
import { Check, ChevronDown, Scale, X } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

function CompareMalls({ malls, selectedIds, setSelectedIds }) {
  const { t } = useLanguage();
  const c = t.compare;
  const [isExpanded, setIsExpanded] = useState(false);

  const rows = [
    [c.rows[0], m => m.type.slice(0, 2).join(", ")],
    [c.rows[1], m => m.bestFor.slice(0, 2).join(", ")],
    [c.rows[2], m => m.type.includes("metro") ? m.transport.metro : c.carOrUber],
    [c.rows[3], m => m.recommendedTime],
    [c.rows[4], m => m.priceLevel],
    [c.rows[5], m => m.familyFriendly],
    [c.rows[6], m => m.outlet],
    [c.rows[7], m => m.premium],
    [c.rows[8], m => m.foodExperience],
    [c.rows[9], m => `${m.touristScore}/10`],
  ];

  const selected = selectedIds.map(id => malls.find(m => m.id === id)).filter(Boolean);

  function updateSlot(index, value) {
    const next = [...selectedIds];
    next[index] = value || undefined;
    setSelectedIds([...new Set(next.filter(Boolean))].slice(0, 3));
  }

  return (
    <section id="comparar" className="bg-white">
      <div className={`section-shell ${isExpanded ? "" : "!py-5 lg:!py-6"}`}>
        <button
          type="button"
          onClick={() => setIsExpanded((previous) => !previous)}
          aria-expanded={isExpanded}
          className="group w-full rounded-3xl border border-ink/8 bg-mist/45 px-5 py-4 text-left shadow-sm transition hover:border-leaf/35 hover:shadow-card sm:px-6 sm:py-5"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold/12 text-gold">
              <Scale size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="eyebrow">{c.eyebrow}</p>
              <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight sm:text-3xl">{c.title}</h2>
              <p className="mt-1 line-clamp-1 max-w-3xl text-sm text-ink/50">{c.subtitle}</p>
            </div>
            <span className="flex shrink-0 items-center gap-2 rounded-full bg-ink px-3 py-2 text-xs font-extrabold text-white transition group-hover:bg-leaf sm:px-4">
              <span className="hidden sm:inline">{isExpanded ? c.collapseCta : c.expandCta}</span>
              <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
            </span>
          </div>
        </button>

        {isExpanded && (
          <div className="mt-6 animate-[fadeIn_300ms_ease-out]">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              {[0, 1, 2].map(slot => (
                <select
                  key={slot}
                  className="control sm:w-44"
                  value={selectedIds[slot] || ""}
                  onChange={e => updateSlot(slot, e.target.value)}
                >
                  <option value="">{c.addMall}</option>
                  {malls.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              ))}
            </div>

            {selected.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-ink/15 bg-[#f8faf6] p-10 text-center">
                <p className="font-extrabold text-ink/40">{c.empty}</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-ink/8">
                <table className="w-full min-w-[560px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-ink text-white">
                      <th className="sticky left-0 bg-ink px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-white/60 w-36">
                        {c.criterion}
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
                                  ? <span className="inline-flex items-center gap-1 text-leaf font-extrabold"><Check size={15} /> {c.yes}</span>
                                  : <span className="inline-flex items-center gap-1 text-ink/30 font-bold"><X size={15} /> {c.no}</span>
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
        )}
      </div>
    </section>
  );
}

export default CompareMalls;
