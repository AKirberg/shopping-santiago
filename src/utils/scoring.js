const zoneAffinity = {
  Providencia: ["Providencia", "Las Condes", "La Reina"],
  "Las Condes": ["Las Condes", "Providencia", "Vitacura"],
  Vitacura: ["Vitacura", "Las Condes"],
  "Santiago Centro": ["Providencia", "La Reina", "La Florida"],
  Aeropuerto: ["Quilicura", "Providencia", "Las Condes"],
  Otra: []
};

const timeWeight = {
  "1-2 horas": { quick: 8, medium: 3, long: -3 },
  "3-4 horas": { quick: 4, medium: 7, long: 2 },
  "medio dia": { quick: 1, medium: 6, long: 6 },
  "dia completo": { quick: 0, medium: 4, long: 8 }
};

function timeBucket(recommendedTime) {
  if (recommendedTime.includes("1-2") || recommendedTime.includes("1-3")) return "quick";
  if (recommendedTime.includes("2-4")) return "medium";
  return "long";
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function scoreMall(mall, answers = {}) {
  let score = mall.touristScore || 0;
  const reasons = [];
  const category = normalize(answers.category);
  const goal = normalize(answers.goal);

  if (category && mall.categories.some((item) => normalize(item) === category)) {
    score += 8;
    reasons.push("Coincide con lo que quieres comprar");
  }

  if (category === "outlet" && mall.outlet) {
    score += 12;
    reasons.push("Especialmente fuerte para outlet");
  }

  if (answers.zone && mall.commune === answers.zone) {
    score += 10;
    reasons.push("Esta en tu zona");
  } else if (answers.zone && zoneAffinity[answers.zone]?.includes(mall.commune)) {
    score += 5;
    reasons.push("Queda en una zona conveniente");
  }

  if (answers.transport === "Metro" && mall.type.includes("metro")) {
    score += 9;
    reasons.push("Buena alternativa usando metro");
  }

  if (answers.transport === "Uber/Taxi" && mall.transport.uber) {
    score += 4;
  }

  if (answers.transport === "Auto" && mall.transport.parking) {
    score += 5;
    reasons.push("Funciona bien si vas en auto");
  }

  if (answers.withKids === "Si" && mall.familyFriendly) {
    score += 8;
    reasons.push("Apto para ir con niños");
  }

  if (answers.time) {
    score += timeWeight[answers.time]?.[timeBucket(mall.recommendedTime)] || 0;
    if (timeBucket(mall.recommendedTime) === "quick") reasons.push("Sirve para una visita corta");
  }

  if (goal === "mejor precio" && mall.outlet) {
    score += 12;
    reasons.push("Mejor perfil para buscar precio");
  }

  if (goal === "marcas premium" && mall.premium) {
    score += 12;
    reasons.push("Tiene perfil premium");
  }

  if (goal === "mejor experiencia" && (mall.foodExperience || mall.premium)) {
    score += 8;
    reasons.push("Buena experiencia de paseo y comida");
  }

  if (goal === "variedad" && mall.type.includes("variety")) {
    score += 8;
    reasons.push("Buena variedad de tiendas");
  }

  if (goal === "rapidez" && mall.type.includes("quick")) {
    score += 10;
    reasons.push("Pensado para resolver en poco tiempo");
  }

  return {
    ...mall,
    recommendationScore: Math.round(score),
    reasons: [...new Set(reasons)].slice(0, 3)
  };
}

export function getRecommendations(malls, answers) {
  return malls
    .map((mall) => scoreMall(mall, answers))
    .sort((a, b) => b.recommendationScore - a.recommendationScore);
}

export function matchesMallFilters(mall, filters) {
  const text = normalize(`${mall.name} ${mall.commune} ${mall.description} ${mall.categories.join(" ")}`);
  const queryOk = !filters.query || text.includes(normalize(filters.query));
  const communeOk = filters.commune === "Todas" || mall.commune === filters.commune;
  const categoryOk = filters.category === "Todas" || mall.categories.includes(filters.category);
  const togglesOk =
    (!filters.outlet || mall.outlet) &&
    (!filters.premium || mall.premium) &&
    (!filters.family || mall.familyFriendly) &&
    (!filters.metro || mall.type.includes("metro")) &&
    (!filters.food || mall.foodExperience) &&
    (!filters.quick || mall.type.includes("quick") || timeBucket(mall.recommendedTime) === "quick") &&
    (!filters.tourist || mall.type.includes("tourist") || mall.touristScore >= 8);

  return queryOk && communeOk && categoryOk && togglesOk;
}
