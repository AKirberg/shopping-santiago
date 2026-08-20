/**
 * Locale-specific prose for each route.
 * ES content lives in routes.json — only EN and PT are here.
 * localizeRoute() merges this with the raw route object.
 */

const routeTranslations = {
  en: {
    "primera-vez-santiago": {
      title: "First time in Santiago",
      summary:
        "A simple route to combine shopping, city views and food in an area that's easy for visitors to find their way around.",
      duration: "3–5 hours",
      bestFor: ["Tourists", "First visit", "Shopping + strolling"],
      stops: {
        "costanera-center":
          "Start with varied shopping and leave time to go up to Sky Costanera if you'd like to add a panoramic view.",
      },
      tips: ["Works really well if you're staying in Providencia or Las Condes."],
    },
    "compras-premium": {
      title: "Premium shopping",
      summary:
        "A circuit for those looking for brands, dining and a more sophisticated experience in the eastern sector.",
      duration: "4–7 hours",
      bestFor: ["Premium", "Fashion", "Dining"],
      stops: {
        "parque-arauco": "Main base for fashion, food and a complete experience.",
        casacostanera:
          "Boutique stop to combine with Nueva Costanera or Alonso de Córdova.",
      },
      tips: ["It's best to use a taxi/Uber between points if you're short on time."],
    },
    "outlet-day": {
      title: "Outlet Day",
      summary:
        "A day focused on discounts, ideal for going with a shopping list and planned transport.",
      duration: "5–8 hours",
      bestFor: ["Discounts", "Outlet", "Planned shopping"],
      stops: {
        "easton-outlet-mall": "Start by comparing brands and sizes without rushing.",
        "arauco-premium-outlet-buenaventura":
          "Round out your price search and check each store's exchange policy.",
      },
      tips: [
        "Consider taxi/Uber or a car, and confirm official opening hours before heading out.",
      ],
    },
    "familia-con-ninos": {
      title: "Family with kids",
      summary:
        "A comfortable route to mix shopping, food and a more active experience for children.",
      duration: "4–6 hours",
      bestFor: ["Families", "Kids", "Shopping + activity"],
      stops: {
        "parque-arauco": "A good base for shopping, food and strolling.",
        "mall-sport":
          "Adds a sports focus and activities to change up the pace of the day.",
      },
      tips: ["Avoid rush hour if you're driving through the eastern sector."],
    },
    "dia-de-lluvia": {
      title: "Rainy day",
      summary:
        "Covered options to handle shopping, food and strolling without depending on the weather.",
      duration: "3–5 hours",
      bestFor: ["Rain", "Families", "Comfortable shopping"],
      stops: {
        "costanera-center": "Practical if you prioritise metro access and a central location.",
        "alto-las-condes":
          "Convenient if you're in the eastern sector and travelling by car or taxi/Uber.",
      },
      tips: ["Choose based on where you're staying to avoid wasting time on transfers."],
    },
    "compras-rapidas-cerca-de-hotel": {
      title: "Quick shopping near your hotel",
      summary:
        "A flexible route to get your shopping done in a few hours depending on where you're staying.",
      duration: "1–3 hours",
      bestFor: ["Short on time", "Hotels", "Practical shopping"],
      stops: {
        "costanera-center":
          "Providencia or Las Condes: a direct option that's easy to explain.",
        "mall-sport":
          "Las Condes / Kennedy: Mall Sport covers the Kennedy corridor well.",
        casacostanera: "Vitacura: a brief stop for boutique shopping or food.",
      },
      tips: ["Prioritise the nearest mall if you only have 3 hours or less."],
    },
  },

  pt: {
    "primera-vez-santiago": {
      title: "Primeira vez em Santiago",
      summary:
        "Uma rota simples para combinar compras, vista urbana e comida em uma área fácil de localizar para os visitantes.",
      duration: "3–5 horas",
      bestFor: ["Turistas", "Primeira visita", "Compras + passeio"],
      stops: {
        "costanera-center":
          "Comece com compras variadas e reserve tempo para subir ao Sky Costanera se quiser incluir uma vista panorâmica.",
      },
      tips: ["Funciona muito bem se você estiver hospedado em Providencia ou Las Condes."],
    },
    "compras-premium": {
      title: "Compras premium",
      summary:
        "Um circuito para quem busca marcas, gastronomia e uma experiência mais sofisticada no setor oriente.",
      duration: "4–7 horas",
      bestFor: ["Premium", "Moda", "Gastronomia"],
      stops: {
        "parque-arauco": "Base principal para moda, comida e uma experiência completa.",
        casacostanera:
          "Parada boutique para combinar com Nueva Costanera ou Alonso de Córdova.",
      },
      tips: ["Vale a pena usar táxi/Uber entre os pontos se você tiver pouco tempo."],
    },
    "outlet-day": {
      title: "Dia de Outlet",
      summary:
        "Um dia voltado para descontos, ideal para ir com lista de compras e transporte planejado.",
      duration: "5–8 horas",
      bestFor: ["Descontos", "Outlet", "Compras planejadas"],
      stops: {
        "easton-outlet-mall": "Comece comparando marcas e tamanhos sem pressa.",
        "arauco-premium-outlet-buenaventura":
          "Complemente a busca por preços e verifique as políticas de troca de cada loja.",
      },
      tips: [
        "Considere táxi/Uber ou carro e confirme os horários oficiais antes de sair.",
      ],
    },
    "familia-con-ninos": {
      title: "Família com crianças",
      summary:
        "Uma rota confortável para misturar compras, comida e uma experiência mais ativa para as crianças.",
      duration: "4–6 horas",
      bestFor: ["Famílias", "Crianças", "Compras + atividade"],
      stops: {
        "parque-arauco": "Boa base para compras, comida e passeio.",
        "mall-sport":
          "Adiciona um foco esportivo e atividades para mudar o ritmo do dia.",
      },
      tips: ["Evite os horários de pico se for de carro pelo setor oriente."],
    },
    "dia-de-lluvia": {
      title: "Dia de chuva",
      summary:
        "Opções cobertas para resolver compras, comida e passeio sem depender do clima.",
      duration: "3–5 horas",
      bestFor: ["Chuva", "Famílias", "Compras confortáveis"],
      stops: {
        "costanera-center": "Prático se você priorizar o metrô e uma localização central.",
        "alto-las-condes":
          "Confortável se você estiver no setor oriente e for de carro ou táxi/Uber.",
      },
      tips: ["Escolha de acordo com sua zona de hospedagem para não perder tempo com deslocamentos."],
    },
    "compras-rapidas-cerca-de-hotel": {
      title: "Compras rápidas perto do hotel",
      summary:
        "Uma rota flexível para resolver as compras em poucas horas conforme onde você estiver hospedado.",
      duration: "1–3 horas",
      bestFor: ["Pouco tempo", "Hotéis", "Compras práticas"],
      stops: {
        "costanera-center":
          "Providencia ou Las Condes: opção direta e fácil de explicar.",
        "mall-sport":
          "Las Condes / Kennedy: o Mall Sport cobre bem o eixo Kennedy.",
        casacostanera: "Vitacura: parada breve para compras boutique ou comida.",
      },
      tips: ["Priorize o shopping mais próximo se você tiver apenas 3 horas ou menos."],
    },
  },
};

/**
 * Returns the route object with locale-specific prose fields merged in.
 * Preserves ids and stop mallIds. Falls back to the original Spanish data
 * for es/unknown locales or missing entries.
 */
export function localizeRoute(route, lang) {
  if (!route) return route;
  if (lang === "es" || !routeTranslations[lang]?.[route.id]) return route;
  const loc = routeTranslations[lang][route.id];
  return {
    ...route,
    title:    loc.title    ?? route.title,
    summary:  loc.summary  ?? route.summary,
    duration: loc.duration ?? route.duration,
    bestFor:  loc.bestFor  ?? route.bestFor,
    stops: Array.isArray(route.stops)
      ? route.stops.map((stop) => ({
          ...stop,
          note: loc.stops?.[stop.mallId] ?? stop.note,
        }))
      : route.stops,
    tips: loc.tips ?? route.tips,
  };
}
