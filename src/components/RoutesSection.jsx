import RouteCard from "./RouteCard";

function RoutesSection({ routes, malls }) {
  const mallMap = Object.fromEntries(malls.map((mall) => [mall.id, mall]));

  return (
    <section id="rutas" className="bg-[#f3f0e8]">
      <div className="section-shell">
        <div className="mb-8 max-w-3xl">
          <p className="eyebrow">Itinerarios editables</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold">Rutas recomendadas</h2>
          <p className="mt-4 text-ink/65">
            Rutas pensadas para turistas con poco tiempo: compras, traslado y experiencia en una misma decision.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {routes.map((route) => <RouteCard key={route.id} route={route} mallMap={mallMap} />)}
        </div>
      </div>
    </section>
  );
}

export default RoutesSection;
