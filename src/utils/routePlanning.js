import { haversineKm } from "./scoring.js";

const timeWindows = {
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

export function analyzeMallRoute(malls, origin, timeKey) {
  const shopping = malls.reduce(
    (total, mall) => {
      const [min, max] = parseRecommendedTime(mall.recommendedTime);
      return { min: total.min + min, max: total.max + max };
    },
    { min: 0, max: 0 }
  );

  if (malls.length < 2) {
    return {
      shoppingTime: formatRange(shopping.min, shopping.max),
      fitsTime: shopping.max <= (timeWindows[timeKey] || Infinity),
      orderRecommended: null,
      orderDistanceKm: 0,
      idealDistanceKm: 0,
    };
  }

  const orderDistanceKm = routeDistance(malls, origin);
  const idealDistanceKm = Math.min(
    ...permutations(malls).map(order => routeDistance(order, origin))
  );
  const orderRecommended =
    orderDistanceKm <= idealDistanceKm * 1.15 || orderDistanceKm - idealDistanceKm <= 1;

  return {
    shoppingTime: formatRange(shopping.min, shopping.max),
    fitsTime: shopping.max <= (timeWindows[timeKey] || Infinity),
    orderRecommended,
    orderDistanceKm: Math.round(orderDistanceKm * 10) / 10,
    idealDistanceKm: Math.round(idealDistanceKm * 10) / 10,
  };
}