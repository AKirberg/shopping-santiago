import MallCard from "./MallCard";

function MallGrid({ malls, compareIds, onCompare, onSelect }) {
  if (!malls.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-ink/20 bg-white p-8 text-center">
        <p className="text-lg font-extrabold">No hay malls para esos filtros.</p>
        <p className="mt-2 text-sm text-ink/60">Prueba quitando algun filtro o usando una busqueda mas general.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {malls.map((mall) => (
        <MallCard
          key={mall.id}
          mall={mall}
          onSelect={onSelect}
          onCompare={onCompare}
          isComparing={compareIds.includes(mall.id)}
        />
      ))}
    </div>
  );
}

export default MallGrid;
