import RouteCard from "./RouteCard";
import { useLanguage } from "../i18n/LanguageContext";

function RoutesSection({ routes, malls }) {
  const { t } = useLanguage();
  const r = t.routes;
  const mallMap = Object.fromEntries(malls.map(m => [m.id, m]));

  return (
    <section id="rutas" className="bg-[#f3f0e8]">
      <div className="section-shell">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow">{r.eyebrow}</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold">{r.title}</h2>
            <p className="mt-3 text-sm leading-6 text-ink/55">{r.subtitle}</p>
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
