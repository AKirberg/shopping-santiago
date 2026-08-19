import { haversineKm } from "./scoring.js";

const timeWindows = {
  "3-4 horas": 4 * 60,
  "medio día": 6 * 60,
  "día completo": 10 * 60,
};

function parseRecommendedTime(value) {
  const values = String(value || "").match(/\d+(?:[.,]\d+)?/g)?.map(Number) || [];
  if (values.length >= 2) return [values[0] * 60, values[1] * 60];
  if (values.length === 1) return [values[0] * 60, values[0] * 60];
  return [60, 120];
}

function permutations(items) {
  if (items.length <= 1) return [items];
  return items.flatMap((item, index) =>
    permutations([...items.slice(0, index), ...items.slice(index + 1)])
      .map(rest => [item, ...rest])
  );
}

function routeDistance(stops, origin) {
  const points = [origin, ...stops]
    .filter(point => Number.isFinite(point?.lat) && Number.isFinite(point?.lng));

  return points.slice(1).reduce((total, point, index) => (
    total + haversineKm(points[index].lat, points[index].lng, point.lat, point.lng)
  ), 0);
}

function formatMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} min`;
  if (!rest) return `${hours} h`;
  return `${hours} h ${rest} min`;
}

function formatRange(min, max) {
  return min === max ? formatMinutes(min) : `${formatMinutes(min)}–${formatMinutes(max)}`;
}

function estimateTravelMinutes(distanceKm, legs) {
  // Santiago city travel: about 17 km/h door-to-door plus a short transfer buffer per leg.
  return Math.round(distanceKm * 3.5 + legs * 4);
}

export function analyzeMallRoute(malls, origin, timeKey) {
  const shopping = malls.reduce(
    (total, mall) => {
      const [min, max] = parseRecommendedTime(mall.recommendedTime);
      return { min: total.min + min, max: total.max + max };
    },
    { min: 0, max: 0 }
  );

  const orderDistanceKm = routeDistance(malls, origin);
  const bestOrder = malls.length < 2
    ? malls
    : permutations(malls).reduce((best, order) =>
      routeDistance(order, origin) < routeDistance(best, origin) ? order : best
    );
  const idealDistanceKm = routeDistance(bestOrder, origin);
  const orderRecommended = malls.length < 2
    ? null
    : orderDistanceKm <= idealDistanceKm * 1.15 || orderDistanceKm - idealDistanceKm <= 1;
  const travelMinutes = estimateTravelMinutes(idealDistanceKm, bestOrder.length);
  const total = {
    min: shopping.min + travelMinutes,
    max: shopping.max + travelMinutes,
  };

  return {
    shoppingTime: formatRange(shopping.min, shopping.max),
    travelTime: formatMinutes(travelMinutes),
    totalTime: formatRange(total.min, total.max),
    fitsTime: total.max <= (timeWindows[timeKey] || Infinity),
    orderRecommended,
    recommendedOrderIds: bestOrder.map(mall => mall.id),
    orderDistanceKm: Math.round(orderDistanceKm * 10) / 10,
    idealDistanceKm: Math.round(idealDistanceKm * 10) / 10,
  };
}