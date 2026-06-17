import RouteCard from "./RouteCard";

function RoutesSection({ routes, malls }) {
  const mallMap = Object.fromEntries(malls.map(m => [m.id, m]));

  return (
    <section id="rutas" className="bg-[#f3f0e8]">
      <div className="section-shell">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow">Itinerarios</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold">Rutas recomendadas</h2>
            <p className="mt-3 text-sm leading-6 text-ink/55">
              Recorridos pensados para turistas: compras, traslado y experiencia en una sola decisión.
            </p>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {routes.map((route, i) => (
            <RouteCard key={route.id} route={route} mallMap={mallMap} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default RoutesSection;
