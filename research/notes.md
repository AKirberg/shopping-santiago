# Notas de investigación: calidad factual de fichas

**Estado:** completado
**Profundidad:** estándar
**Fecha de corte:** 2026-08-24

## Plan

- **Pregunta:** ¿Qué datos de las 25 fichas de malls, 2 outlets y 6 rutas pueden confirmarse con fuentes primarias y cuáles deben corregirse, retirarse o quedar pendientes?
- **Alcance:** nombres, comunas, ubicación, Metro, horarios, tiendas, atracciones, servicios, aeropuerto, tiempos y rasgos diferenciales; se excluyen guías, comparaciones, URLs e imágenes.
- **Audiencia:** visitantes de Santiago que necesitan información práctica y verificable.
- **Entregable:** datos públicos depurados, registro por ficha con fuentes/estado y validación SEO sin cambios de URLs.

## Áreas

| # | Área | Estado | Fuentes |
|---|---|---|---|
| 1 | Centros turísticos y sector oriente | completado | 24 evidencias |
| 2 | Outlets, norte y poniente | completado | 23 evidencias |
| 3 | Centros conectados por Metro al sur y oriente | completado | 29 evidencias |
| 4 | Centros vecinales y sector alto | completado | 35 evidencias |
| 5 | Centros del eje central/sur y rutas | completado | 27 evidencias |

## Criterios de fuentes

- Prioridad 1: sitios y directorios oficiales de cada centro, Metro de Santiago y organismos públicos.
- Prioridad 2: operadores inmobiliarios o institucionales responsables del centro.
- Fuentes secundarias: solo para corroborar, nunca para completar datos ausentes.
- Snippets de buscadores, reseñas y blogs: no se aceptan como evidencia final.

## Cobertura

- [x] Comuna, ubicación y coordenadas verificadas o retiradas para los 27 centros.
- [x] Estaciones y líneas de Metro confirmadas o retiradas.
- [x] Horarios tratados como datos volátiles con fuente/fecha o pendientes.
- [x] Tiendas y servicios no confirmados retirados; sin listas copiadas.
- [x] Atracciones cercanas confirmadas o retiradas.
- [x] Afirmaciones de cercanía al aeropuerto retiradas por falta de respaldo.
- [x] Diferenciador específico documentado para cada centro.
- [x] Las 6 rutas usan únicamente paradas y notas verificadas.
- [x] ES, PT-BR y EN contienen los mismos hechos.
- [x] Las 135 URLs canónicas y 162 salidas SEO permanecen intactas.

## Hallazgos preliminares

- Las 27 fichas carecen de fuentes por campo y fecha de revisión.
- Todas usan el mismo aviso de horarios, pero no almacenan horarios oficiales.
- Hay listas de tiendas fuertemente repetidas y marcas aparentemente asignadas por plantilla.
- Existen contradicciones de transporte entre idiomas.
- Hay afirmaciones de aeropuerto y tiempos de traslado sin evidencia adjunta.
- Paseo Quilín corresponde a Peñalolén, Mallplaza Oeste a Cerrillos y Mallplaza Alameda a Estación Central.
- MUT conecta directamente con Metro Tobalaba L1/L4; Mallplaza Tobalaba está en Puente Alto y no en el eje Tobalaba-Providencia.
- La entidad Parque Arauco Oriente no tiene ficha oficial separada vigente y debe describirse como parte de Parque Arauco sin cambiar su URL actual.

## Conflictos y preguntas abiertas

- Las clasificaciones editoriales de precio, puntuación turística y tiempo recomendado no son hechos oficiales; deben distinguirse de datos verificados o retirarse de las fichas.
- El indicador `airportRoute` y el temporizador de vuelo usan supuestos distintos; no deben presentarse como proximidad factual sin evidencia.

## Vacíos

- Horarios completos y directorios dinámicos de Mallplaza: pendientes cuando la fuente oficial no fue extraíble.
- Estación/línea de Metro: pendiente en centros donde solo se confirmó la estación o la dirección, sin vínculo oficial con el mall.
- Cercanía y tiempos al aeropuerto: sin respaldo oficial; retirar de contenido público.

## Conclusiones

- Se auditaron las 25 URLs de malls, 2 outlets y 6 rutas con 138 capturas de fuentes primarias.
- Se corrigieron nombres vigentes, comunas, direcciones, Metro y URLs oficiales; los datos no respaldados se retiraron o quedaron ausentes.
- Los inventarios públicos se redujeron a muestras pequeñas del directorio oficial; ocho centros quedaron sin tiendas publicadas porque su directorio dinámico no pudo extraerse.
- Se eliminaron todas las afirmaciones de aeropuerto, los niveles de precio y las puntuaciones turísticas no respaldadas.
- Las duraciones de rutas quedaron ausentes. Los tiempos de visita de malls se conservan únicamente como sugerencias editoriales y se etiquetan “por Shopeando”.
- `parque-arauco-oriente` conserva su URL histórica, pero se excluye como destino independiente y emite Schema.org `WebPage` vinculado a Parque Arauco, sin dirección ni geolocalización propias.
- `src/data/contentAudit.json` contiene el registro completo por ficha y campo con fecha, fuente y estado.
- `npm run build` valida contenido, 135 URLs canónicas, 162/162 archivos SEO y el identificador de analytics.

## Índice de fuentes primarias

El detalle completo de URL, campo y estado está en `src/data/contentAudit.json`; las capturas se conservan en `research/sources/`.

- Cenco Malls: [Costanera](https://www.cencomalls.cl/costanera), [Alto las Condes](https://www.cencomalls.cl/altolascondes), [Florida](https://www.cencomalls.cl/florida) y [Portal La Dehesa](https://www.cencomalls.cl/ladehesa).
- Parque Arauco: [centro y directorio](https://www.parquearauco.cl/).
- Casacostanera: [sitio oficial](https://www.casacostanera.cl/).
- Mall Sport: [sitio oficial](https://www.mallsport.cl/).
- MUT: [sitio oficial](https://mut.cl/es/) y [cómo llegar](https://mut.cl/es/como-llegar/).
- Outlets: [Easton](https://www.eastonmallsantiago.cl/) y [Arauco Premium Outlet Buenaventura](https://www.araucopremiumoutletbuenaventura.cl/).
- Mallplaza: [Egaña](https://www.mallplaza.com/cl/egana/), [Vespucio](https://www.mallplaza.com/cl/vespucio/), [Norte](https://www.mallplaza.com/cl/norte/), [Oeste](https://www.mallplaza.com/cl/oeste), [Los Dominicos](https://www.mallplaza.com/cl/losdominicos), [Tobalaba](https://www.mallplaza.com/cl/tobalaba) y [Alameda](https://www.mallplaza.com/cl/alameda/).
- Arauco: [Maipú](https://www.araucomaipu.cl/) y [Quilicura](https://www.araucoquilicura.cl/).
- Otros centros: [Apumanque](https://apumanque.cl/), [Mall Paseo Quilín](https://www.paseoquilin.cl/), [Espacio Urbano Gran Avenida](https://www.espaciourbano.cl/centro-comercial/gran-avenida), [VIVO Los Trapenses](https://www.mallsyoutletsvivo.cl/vivo-los-trapenses/), [MidMall](https://www.midmall.cl/), [Mall Barrio Independencia](https://www.mallbarrioindependencia.cl/) y [Mall Paseo San Bernardo](https://paseosanbernardo.cl/).
- Transporte y organismos públicos: [Metro de Santiago](https://www.metro.cl/el-viaje/plano-de-red), [Municipalidad de Providencia](https://www.providencia.cl/provi/explora/turismo/conocenos/costanera-center), [Municipalidad de San Miguel](https://web.sanmiguel.cl/dimos-el-vamos-a-sala-comunitaria-gratuita-en-espacio-urbano/) y [SEA](https://pertinencia.sea.gob.cl/sea-pertinence-web/services/public/document/3FCEA76E-6066-4BF8-842C-87FFA59A53D1).