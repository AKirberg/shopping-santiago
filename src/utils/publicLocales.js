export const PUBLIC_LOCALES = {
  es: { prefix: "", hreflang: "es-CL", label: "Español" },
  pt: { prefix: "/pt-br", hreflang: "pt-BR", label: "Português (Brasil)" },
  en: { prefix: "/en", hreflang: "en", label: "English" },
};

export const localizedCopy = {
  es: {
    home: "Inicio", malls: "Malls", outlets: "Outlets", routes: "Rutas de compras",
    guides: "Guías de compras", comparisons: "Comparaciones", read: "Leer más",
    visit: "Ver ficha", map: "Ver en Google Maps", route: "Ver ruta",
    bestFor: "Ideal para", notIdealFor: "No ideal para", tips: "Consejos",
    stores: "Tiendas destacadas", transport: "Cómo llegar", nearby: "Atracciones cercanas",
    relatedMalls: "Malls mencionados", relatedRoutes: "Rutas relacionadas",
    relatedGuides: "Guías relacionadas", relatedComparisons: "Comparaciones relacionadas",
    duration: "Tiempo sugerido por Shopeando", official: "Sitio oficial",
    editorial: "Guía editorial", comparison: "Comparación", shoppingRoute: "Ruta de compras",
    seoSuffix: { mall: "Información y cómo llegar", outlet: "Outlet · Información y cómo llegar", route: "Ruta de compras en Santiago", guide: "Guía de compras en Santiago", comparison: "Comparación de malls en Santiago" },
    hub: {
      malls: ["Malls en Santiago", "Centros comerciales seleccionados para planificar tus compras en Santiago de Chile."],
      outlets: ["Outlets en Santiago", "Outlets para encontrar marcas y descuentos en Santiago de Chile."],
      rutas: ["Rutas de compras en Santiago", "Itinerarios para combinar compras, traslados y tiempo disponible."],
      guias: ["Guías de compras en Santiago", "Artículos editoriales para planificar tus compras en Santiago de Chile."],
      comparar: ["Comparaciones de malls", "Comparaciones editoriales para ayudarte a elegir dónde comprar."],
    },
  },
  pt: {
    home: "Início", malls: "Shoppings", outlets: "Outlets", routes: "Roteiros de compras",
    guides: "Guias de compras", comparisons: "Comparações", read: "Ler guia",
    visit: "Ver detalhes", map: "Ver no Google Maps", route: "Ver roteiro",
    bestFor: "Ideal para", notIdealFor: "Não é ideal para", tips: "Dicas",
    stores: "Lojas em destaque", transport: "Como chegar", nearby: "Atrações próximas",
    relatedMalls: "Shoppings mencionados", relatedRoutes: "Roteiros relacionados",
    relatedGuides: "Guias relacionados", relatedComparisons: "Comparações relacionadas",
    duration: "Tempo sugerido pela Shopeando", official: "Site oficial",
    editorial: "Guia editorial", comparison: "Comparação", shoppingRoute: "Roteiro de compras",
    seoSuffix: { mall: "Informações e como chegar", outlet: "Outlet · Informações e como chegar", route: "Roteiro de compras em Santiago", guide: "Guia de compras em Santiago", comparison: "Comparação de shoppings em Santiago" },
    hub: {
      malls: ["Shoppings em Santiago", "Centros comerciais selecionados para planejar suas compras em Santiago do Chile."],
      outlets: ["Outlets em Santiago", "Outlets para encontrar marcas e descontos em Santiago do Chile."],
      rutas: ["Roteiros de compras em Santiago", "Itinerários para combinar compras, deslocamentos e o tempo disponível."],
      guias: ["Guias de compras em Santiago", "Artigos editoriais para planejar suas compras em Santiago do Chile."],
      comparar: ["Comparações de shoppings", "Comparações editoriais para ajudar você a escolher onde comprar."],
    },
  },
  en: {
    home: "Home", malls: "Malls", outlets: "Outlets", routes: "Shopping routes",
    guides: "Shopping guides", comparisons: "Comparisons", read: "Read guide",
    visit: "View details", map: "View on Google Maps", route: "View route",
    bestFor: "Best for", notIdealFor: "Not ideal for", tips: "Tips",
    stores: "Featured stores", transport: "Getting there", nearby: "Nearby attractions",
    relatedMalls: "Malls mentioned", relatedRoutes: "Related routes",
    relatedGuides: "Related guides", relatedComparisons: "Related comparisons",
    duration: "Time suggested by Shopeando", official: "Official website",
    editorial: "Editorial guide", comparison: "Comparison", shoppingRoute: "Shopping route",
    seoSuffix: { mall: "Information and directions", outlet: "Outlet · Information and directions", route: "Shopping route in Santiago", guide: "Shopping guide to Santiago", comparison: "Santiago mall comparison" },
    hub: {
      malls: ["Malls in Santiago", "Selected shopping centres to help plan your shopping in Santiago, Chile."],
      outlets: ["Outlets in Santiago", "Outlets for finding brands and discounts in Santiago, Chile."],
      rutas: ["Shopping routes in Santiago", "Itineraries that combine shopping, transport and the time you have available."],
      guias: ["Shopping guides in Santiago", "Editorial articles to help plan your shopping in Santiago, Chile."],
      comparar: ["Mall comparisons", "Editorial comparisons to help you choose where to shop."],
    },
  },
};

export function normalizeLocale(locale) {
  return PUBLIC_LOCALES[locale] ? locale : "es";
}

export function localizedPath(path, locale = "es") {
  const prefix = PUBLIC_LOCALES[normalizeLocale(locale)].prefix;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${prefix}${normalized}`.replace(/\/{2,}/g, "/");
}

export function publicAlternates(path) {
  return Object.entries(PUBLIC_LOCALES).map(([locale, config]) => ({
    locale,
    hreflang: config.hreflang,
    path: localizedPath(path, locale),
  }));
}

export function alternateLinkTags(siteUrl, path) {
  return [
    ...publicAlternates(path).map(({ hreflang, path: alternatePath }) =>
      `<link rel="alternate" hreflang="${hreflang}" href="${siteUrl}${alternatePath}" />`
    ),
    `<link rel="alternate" hreflang="x-default" href="${siteUrl}${localizedPath(path, "es")}" />`,
  ].join("\n    ");
}