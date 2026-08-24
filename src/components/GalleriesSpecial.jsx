import { ArrowRight, BadgeInfo, Camera, MapPinned, Route, Store, Umbrella } from "lucide-react";

function GalleriesSpecial({ data }) {
  const featured = data.items.filter((item) => item.touristScore >= 8).slice(0, 8);

  return (
    <section id="galerias" className="bg-[#f3f0e8]">
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="eyebrow">Especial centro histórico</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              Galerías de Santiago Centro
            </h2>
            <p className="mt-4 max-w-2xl text-ink/68">
              {data.meta.summary}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat icon={Store} value={data.meta.totalKnownGalleries} label="galerías conocidas" />
            <Stat icon={Route} value={`${data.meta.networkLengthKm} km`} label="trama peatonal" />
            <Stat icon={Umbrella} value="bajo techo" label="ideal con lluvia" />
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] bg-ink p-6 text-white shadow-soft">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <MapPinned size={22} />
              </span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/50">Ruta sugerida</p>
                <h3 className="text-2xl font-extrabold">Caminar, vitrinear, mirar arquitectura</h3>
              </div>
            </div>
            <div className="mt-6 grid gap-4">
              {data.routes.map((routeItem) => (
                <article key={routeItem.id} className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-extrabold">{routeItem.title}</p>
                      <p className="mt-1 text-sm font-bold text-white/55">{routeItem.duration}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {routeItem.bestFor.map((tag) => (
                        <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/75">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-bold text-white/70">
                    {routeItem.stops.map((stopId, index) => {
                      const stop = data.items.find((item) => item.id === stopId);
                      return (
                        <span key={stopId} className="inline-flex items-center gap-2">
                          {index > 0 && <ArrowRight size={14} className="text-coral" />}
                          {stop?.name || stopId}
                        </span>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {featured.map((gallery) => (
              <article key={gallery.id} className="rounded-[2rem] border border-ink/10 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="tag bg-mist">{gallery.axis}</span>
                  <span className="rounded-full bg-ink px-3 py-1 text-xs font-extrabold text-white">
                    {gallery.touristScore}/10
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-extrabold leading-tight">{gallery.name}</h3>
                <p className="mt-2 text-sm font-bold text-ink/48">{gallery.address}</p>
                <p className="mt-4 text-sm leading-6 text-ink/65">{gallery.note}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {gallery.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <InfoCard
            icon={Camera}
            title="Cómo usar este especial"
            text="Trátalo como una ruta de paseo urbano: entra por una galería, sal por otra calle, cruza a la siguiente y combina compras pequeñas con patrimonio."
          />
          <InfoCard
            icon={BadgeInfo}
            title="Dato editable"
            text={`${data.items.length} galerías iniciales cargadas. El archivo JSON permite sumar las 74, agregar rubros reales, accesos y estado de conservación sin backend.`}
          />
        </div>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="rounded-[1.5rem] border border-ink/10 bg-white p-5 shadow-sm">
      <Icon className="text-coral" size={21} />
      <p className="mt-4 text-3xl font-extrabold">{value}</p>
      <p className="text-sm font-bold text-ink/55">{label}</p>
    </div>
  );
}

function InfoCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-sm">
      <Icon className="text-leaf" size={23} />
      <h3 className="mt-4 text-xl font-extrabold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-ink/65">{text}</p>
    </div>
  );
}

export default GalleriesSpecial;
