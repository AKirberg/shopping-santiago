export const BOARDING_CLOSE_MIN = 30; // boarding closes 30 min before departure
export const CHECKIN_SECURITY_MIN = 60; // check-in + security buffer
export const DEFAULT_TRAVEL_TO_MALL_MIN = 20;
export const DEFAULT_TRAVEL_TO_AIRPORT_MIN = 45;

/**
 * Compute full time breakdown given a flight departure time string ("HH:MM")
 * and travel parameters.
 *
 * Returns null if no flight time provided.
 * Returns an object with:
 *  - shoppingMin: effective shopping minutes available (may be negative)
 *  - availableHours: shoppingMin / 60
 *  - departureTime: "HH:MM" string
 *  - boardingTime: "HH:MM" — when boarding closes (departure - 30 min)
 *  - mustArriveAirportTime: "HH:MM" — when to arrive at airport
 *  - mustLeaveMallTime: "HH:MM" — deadline to leave the mall
 *  - minutesToAirport: number
 *  - travelToMallMin: number
 */
export function computeTimeBreakdown(flightTimeStr, minutesToAirport = DEFAULT_TRAVEL_TO_AIRPORT_MIN, travelToMallMin = DEFAULT_TRAVEL_TO_MALL_MIN) {
  if (!flightTimeStr) return null;

  const [h, m] = flightTimeStr.split(":").map(Number);
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  let departureAbsMin = h * 60 + m;

  // Handle next-day flights (if departure is earlier than now, assume next day)
  if (departureAbsMin < nowMin) departureAbsMin += 24 * 60;

  const boardingClosesMin = departureAbsMin - BOARDING_CLOSE_MIN;
  const mustArriveAirportMin = boardingClosesMin - CHECKIN_SECURITY_MIN;
  const mustLeaveMallMin = mustArriveAirportMin - minutesToAirport;
  const mallArrivalMin = nowMin + travelToMallMin;
  const shoppingMin = mustLeaveMallMin - mallArrivalMin;

  return {
    nowMin,
    departureAbsMin,
    boardingClosesMin,
    mustArriveAirportMin,
    mustLeaveMallMin,
    mallArrivalMin,
    shoppingMin,
    availableHours: shoppingMin / 60,
    minutesToAirport,
    travelToMallMin,
    departureTime: absMinToHHMM(departureAbsMin),
    boardingTime: absMinToHHMM(boardingClosesMin),
    mustArriveAirportTime: absMinToHHMM(mustArriveAirportMin),
    mustLeaveMallTime: absMinToHHMM(mustLeaveMallMin),
  };
}

function absMinToHHMM(absMin) {
  const h = Math.floor(absMin / 60) % 24;
  const m = absMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function fmtHours(hours) {
  if (hours <= 0) return "0h";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}min`;
  return `${h}h ${m}min`;
}

export function fmtMin(min) {
  if (min <= 0) return "0min";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}
