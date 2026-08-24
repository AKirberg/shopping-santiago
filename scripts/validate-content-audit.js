import { existsSync, readFileSync } from "node:fs";
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { localizeMall } from "../src/i18n/mallContent.js";
import { localizeRoute } from "../src/i18n/routeContent.js";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const readJson = (path) => JSON.parse(readFileSync(resolve(ROOT, path), "utf8"));
const malls = readJson("src/data/malls.json");
const routes = readJson("src/data/routes.json");
const audit = readJson("src/data/contentAudit.json");

const expectedMallIds = [
  "costanera-center", "parque-arauco", "alto-las-condes", "casacostanera", "mall-sport",
  "easton-outlet-mall", "arauco-premium-outlet-buenaventura", "mallplaza-egana", "florida-center",
  "mallplaza-vespucio", "mallplaza-norte", "apumanque", "portal-la-dehesa", "mallplaza-oeste",
  "arauco-maipu", "parque-arauco-oriente", "mallplaza-los-dominicos", "vivo-los-trapenses",
  "paseo-quilin", "mallplaza-tobalaba", "espacio-urbano-gran-avenida", "midmall-maipu",
  "mallplaza-alameda", "mall-barrio-independencia", "mall-arauco-quilicura", "paseo-san-bernardo",
  "mut-mercado-urbano-tobalaba",
];
const expectedRouteIds = [
  "primera-vez-santiago", "compras-premium", "outlet-day", "familia-con-ninos",
  "dia-de-lluvia", "compras-rapidas-cerca-de-hotel",
];
const expectedOutletIds = new Set(["easton-outlet-mall", "arauco-premium-outlet-buenaventura"]);
const allowedStatuses = new Set(["confirmado", "corregido", "retirado", "pendiente"]);
const sourcedStatuses = new Set(["confirmado", "corregido"]);
const requiredMallAuditFields = [
  "name", "commune", "mapsQuery", "officialUrl", "description", "transport.metro",
  "transport.parking", "transport.uber", "stores", "nearbyAttractions", "airportRoute",
  "priceLevel", "touristScore", "coordinates",
];
const requiredMallEditorialFields = [
  "type", "categories", "recommendedTime", "bestFor", "notIdealFor", "tips", "familyFriendly",
  "premium", "foodExperience", "foodLevel", "touristZone", "checkOfficialHours",
];
const requiredRouteAuditFields = ["title", "summary", "duration", "stops", "tips"];
const requiredRouteEditorialFields = ["bestFor", "tips"];
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const isHttpUrl = (value) => typeof value === "string" && /^https?:\/\/\S+$/i.test(value.trim());
const sameOrderedIds = (items, ids) => items.length === ids.length && items.every((item, i) => item.id === ids[i]);
const publicValue = (item, field) => field.split(".").reduce((value, key) => value?.[key], item);
const hasPublicField = (item, field) => {
  const parts = field.split(".");
  const key = parts.pop();
  const parent = parts.reduce((value, part) => value?.[part], item);
  return parent != null && Object.hasOwn(parent, key);
};

check(sameOrderedIds(malls, expectedMallIds), "El orden o los IDs canónicos de malls/outlets cambió.");
check(sameOrderedIds(routes, expectedRouteIds), "El orden o los IDs canónicos de rutas cambió.");
check(malls.filter((mall) => mall.outlet).length === 2 && malls.every((mall) => Boolean(mall.outlet) === expectedOutletIds.has(mall.id)), "La clasificación canónica de los dos outlets cambió.");

const mallIds = new Set(malls.map((mall) => mall.id));
for (const route of routes) {
  check(Array.isArray(route.stops) && route.stops.length > 0, `${route.id}: la ruta no tiene paradas.`);
  for (const stop of route.stops ?? []) check(mallIds.has(stop.mallId), `${route.id}: parada desconocida ${stop.mallId}.`);
}

check(audit.version === 1, "contentAudit.json usa una versión inesperada.");
check(/^\d{4}-\d{2}-\d{2}$/.test(audit.reviewedAt ?? ""), "Falta una fecha de revisión válida.");
check(Array.isArray(audit.entries) && audit.entries.length === 33, "La auditoría debe cubrir 33 fichas.");
const auditEntries = new Map((audit.entries ?? []).map((entry) => [entry.id, entry]));
check(auditEntries.size === 33, "La auditoría contiene IDs duplicados.");

for (const entry of audit.entries ?? []) {
  check(Array.isArray(entry.sources) && entry.sources.length > 0, `${entry.id}: faltan fuentes primarias.`);
  for (const source of entry.sources ?? []) check(isHttpUrl(source), `${entry.id}: fuente primaria no HTTP(S).`);
  for (const [field, record] of Object.entries(entry.fields ?? {})) {
    check(allowedStatuses.has(record?.status), `${entry.id}.${field}: estado inválido.`);
    check(Object.hasOwn(record ?? {}, "source"), `${entry.id}.${field}: falta la clave source.`);
    check(typeof record?.note === "string" && record.note.trim(), `${entry.id}.${field}: falta note.`);
    if (sourcedStatuses.has(record?.status)) check(isHttpUrl(record.source), `${entry.id}.${field}: confirmado/corregido exige source HTTP(S).`);
  }
}

for (const mall of malls) {
  const entry = auditEntries.get(mall.id);
  check(Boolean(entry), `${mall.id}: falta entrada de auditoría.`);
  check(entry?.kind === (mall.outlet ? "outlet" : "mall"), `${mall.id}: kind de auditoría incorrecto.`);
  for (const field of requiredMallAuditFields) check(Boolean(entry?.fields?.[field]), `${mall.id}: falta auditoría factual de ${field}.`);
  for (const field of requiredMallEditorialFields) check(typeof entry?.editorialFields?.[field] === "string" && entry.editorialFields[field].trim(), `${mall.id}: falta documentación editorial de ${field}.`);
  check(!Object.hasOwn(entry?.editorialFields ?? {}, "types"), `${mall.id}: editorialFields.types debe llamarse type.`);
  const editorialNarrative = Object.values(entry?.editorialFields ?? {}).join(" ").toLowerCase();
  const describesIntegratedEntity = /(destino independiente|entidad integrada|duración de visita independiente|oferta gastronómica independiente)/.test(editorialNarrative);
  check(
    mall.id === "parque-arauco-oriente" ? describesIntegratedEntity : !describesIntegratedEntity,
    `${mall.id}: la justificación editorial no coincide con su condición standalone/integrada.`,
  );
  if (mall.id === "parque-arauco-oriente") {
    for (const field of ["entityStatus", "integratedInto"]) check(Boolean(entry?.fields?.[field]), `${mall.id}: falta auditoría factual de ${field}.`);
  } else {
    for (const field of ["entityStatus", "integratedInto"]) check(!Object.hasOwn(entry?.fields ?? {}, field), `${mall.id}: ${field} solo corresponde a la ficha integrada.`);
  }

  check(typeof mall.name === "string" && mall.name.trim(), `${mall.id}: falta name.`);
  check(typeof mall.description === "string" && mall.description.trim(), `${mall.id}: falta description.`);
  check(typeof mall.mapsQuery === "string" && mall.mapsQuery.trim(), `${mall.id}: falta mapsQuery.`);
  check(isHttpUrl(mall.officialUrl), `${mall.id}: officialUrl no es válida.`);
  check(Array.isArray(mall.stores), `${mall.id}: stores debe ser un array.`);
  check(Array.isArray(mall.nearbyAttractions), `${mall.id}: nearbyAttractions debe ser un array.`);

  const fields = entry?.fields ?? {};
  for (const field of ["transport.metro", "transport.parking", "commune"]) {
    if (fields[field]?.status === "pendiente") check(publicValue(mall, field) == null, `${mall.id}: ${field} pendiente debe publicarse null.`);
  }
  if (["pendiente", "retirado"].includes(fields.stores?.status)) check(mall.stores.length === 0, `${mall.id}: stores pendiente/retirado debe publicarse [].`);
  if (fields.nearbyAttractions?.status === "retirado") check(mall.nearbyAttractions.length === 0, `${mall.id}: nearbyAttractions retirado debe publicarse [].`);
  if (fields.airportRoute?.status === "retirado") check(!hasPublicField(mall, "airportRoute"), `${mall.id}: airportRoute retirado debe estar ausente.`);
  for (const field of ["priceLevel", "touristScore", "transport.uber"]) {
    if (fields[field]?.status === "retirado") check(publicValue(mall, field) == null, `${mall.id}: ${field} retirado debe publicarse null.`);
  }

  const integrated = mall.entityStatus != null || mall.integratedInto != null;
  if (integrated) {
    check(mall.id === "parque-arauco-oriente", `${mall.id}: solo Parque Arauco Oriente puede ser ficha integrada.`);
    check(mall.entityStatus === "integrated" && mall.integratedInto === "parque-arauco", `${mall.id}: metadatos de integración inválidos.`);
    check(mall.lat == null && mall.lng == null, `${mall.id}: una ficha integrada debe publicar lat/lng null.`);
    check(Array.isArray(mall.type) && mall.type.length === 0, `${mall.id}: una ficha integrada no debe tener type.`);
    check(Array.isArray(mall.categories) && mall.categories.length === 0, `${mall.id}: una ficha integrada no debe tener categories.`);
    check(mall.recommendedTime == null, `${mall.id}: una ficha integrada no debe tener recommendedTime.`);
    check(mall.familyFriendly === false && mall.premium === false && mall.foodExperience === false, `${mall.id}: una ficha integrada no debe tener badges de destino activos.`);
    check(mall.foodLevel == null && mall.touristZone == null, `${mall.id}: una ficha integrada no debe tener clasificaciones de destino.`);
    check(fields.coordinates?.status === "retirado" && fields.coordinates?.source == null, `${mall.id}: coordinates integradas deben estar retiradas y sin fuente.`);
    for (const field of ["entityStatus", "integratedInto"]) check(fields[field]?.status === "corregido" && isHttpUrl(fields[field]?.source), `${mall.id}: falta auditoría corregida de ${field}.`);
  } else if (mall.id === "parque-arauco-oriente") {
    check(Number.isFinite(mall.lat) && Number.isFinite(mall.lng), `${mall.id}: transición de integración con coordenadas inválidas.`);
    check(fields.coordinates?.status === "retirado" && fields.coordinates?.source == null, `${mall.id}: coordinates debe quedar retirada para la integración.`);
  } else {
    check(Number.isFinite(mall.lat) && mall.lat >= -90 && mall.lat <= 90, `${mall.id}: lat fuera de rango.`);
    check(Number.isFinite(mall.lng) && mall.lng >= -180 && mall.lng <= 180, `${mall.id}: lng fuera de rango.`);
    check(fields.coordinates?.status === "confirmado" && isHttpUrl(fields.coordinates?.source), `${mall.id}: coordinates standalone debe estar confirmada con fuente.`);
    check(fields.coordinates?.source?.includes(String(mall.lat)) && fields.coordinates?.source?.includes(String(mall.lng)), `${mall.id}: la fuente cartográfica no está basada en lat/lng.`);
  }

  check(typeof mall.imageUrl === "string" && mall.imageUrl.startsWith("/"), `${mall.id}: imageUrl inválida.`);
  const assetPath = resolve(ROOT, "public", (mall.imageUrl ?? "").replace(/^\/+/, ""));
  check(assetPath.startsWith(resolve(ROOT, "public") + sep) && existsSync(assetPath), `${mall.id}: imageUrl no existe bajo public.`);
}

for (const route of routes) {
  const entry = auditEntries.get(route.id);
  check(Boolean(entry), `${route.id}: falta entrada de auditoría.`);
  check(entry?.kind === "route", `${route.id}: kind de auditoría incorrecto.`);
  for (const field of requiredRouteAuditFields) check(Boolean(entry?.fields?.[field]), `${route.id}: falta auditoría factual de ${field}.`);
  for (const field of requiredRouteEditorialFields) check(typeof entry?.editorialFields?.[field] === "string" && entry.editorialFields[field].trim(), `${route.id}: falta documentación editorial de ${field}.`);
  if (entry?.fields?.duration?.status === "pendiente") check(route.duration == null, `${route.id}: duration pendiente debe publicarse null.`);
}

const schemas = {
  mall: {
    structural: new Set(["id", "outlet", "transport"]),
    factual: new Set(["name", "commune", "mapsQuery", "description", "nearbyAttractions", "lat", "lng", "stores", "officialUrl", "priceLevel", "touristScore", "airportRoute", "entityStatus", "integratedInto"]),
    editorial: new Set(["type", "bestFor", "notIdealFor", "categories", "recommendedTime", "familyFriendly", "premium", "foodExperience", "tips", "checkOfficialHours", "foodLevel", "touristZone"]),
    asset: new Set(["imageUrl"]),
  },
  transport: { factual: new Set(["metro", "uber", "parking"]) },
  store: { factual: new Set(["name", "cat"]) },
  route: { structural: new Set(["id"]), factual: new Set(["title", "summary", "duration", "stops"]), editorial: new Set(["bestFor", "tips"]) },
  stop: { structural: new Set(["mallId"]), factual: new Set(["note"]) },
};
function checkKnownKeys(object, schema, label) {
  const classified = new Set(Object.values(schema).flatMap((keys) => [...keys]));
  for (const key of Object.keys(object ?? {})) check(classified.has(key), `${label}: clave pública nueva no clasificada: ${key}.`);
}
for (const mall of malls) {
  checkKnownKeys(mall, schemas.mall, mall.id);
  checkKnownKeys(mall.transport, schemas.transport, `${mall.id}.transport`);
  for (const [index, store] of (mall.stores ?? []).entries()) checkKnownKeys(store, schemas.store, `${mall.id}.stores[${index}]`);
}
for (const route of routes) {
  checkKnownKeys(route, schemas.route, route.id);
  for (const [index, stop] of (route.stops ?? []).entries()) checkKnownKeys(stop, schemas.stop, `${route.id}.stops[${index}]`);
}

const localizedMalls = [...malls.map((mall) => localizeMall(mall, "en")), ...malls.map((mall) => localizeMall(mall, "pt"))];
const localizedRoutes = [...routes.map((route) => localizeRoute(route, "en")), ...routes.map((route) => localizeRoute(route, "pt"))];
for (const [index, mall] of malls.entries()) {
  check(localizedMalls[index]?.description !== mall.description, `${mall.id}: falta descripción EN.`);
  check(localizedMalls[index + malls.length]?.description !== mall.description, `${mall.id}: falta descripción PT-BR.`);
}
for (const [index, route] of routes.entries()) {
  check(localizedRoutes[index]?.summary !== route.summary, `${route.id}: falta resumen EN.`);
  check(localizedRoutes[index + routes.length]?.summary !== route.summary, `${route.id}: falta resumen PT-BR.`);
}
const publicContent = JSON.stringify({ malls, routes, localizedMalls, localizedRoutes });
const forbiddenPublicLanguage = /(aeropuerto|airport|aeroporto|pendient|pending|pendente|confirmad|confirmed|confirmação|verificad|verified|auditor(?:ía|ia)?)/i;
check(!forbiddenPublicLanguage.test(publicContent), "El contenido público incluye lenguaje interno o aeropuerto no respaldado.");
const descriptions = malls.map((mall) => mall.description.trim());
check(new Set(descriptions).size === descriptions.length, "Hay descripciones de malls duplicadas.");

if (errors.length) {
  console.error(`Validación de contenido fallida (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Contenido validado: ${malls.length} centros, ${routes.length} rutas, ${audit.entries.length} auditorías y traducciones EN/PT-BR completas.`);
