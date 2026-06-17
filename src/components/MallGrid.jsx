import MallCard from "./MallCard";

function MallGrid({ malls, compareIds, onCompare, onSelect, availableHours }) {
  if (!malls.length) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center">
        <p className="font-extrabold text-ink/40">No hay malls para esos filtros.</p>
        <p className="mt-1 text-sm text-ink/35">Prueba quitando algún filtro.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {malls.map(mall => (
        <MallCard
          key={mall.id}
          mall={mall}
          onSelect={onSelect}
          onCompare={onCompare}
          isComparing={compareIds.includes(mall.id)}
          availableHours={availableHours}
        />
      ))}
    </div>
  );
}

export default MallGrid;
