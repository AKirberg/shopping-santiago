/**
 * Locale-specific editorial prose for each comparison.
 * ES content lives in comparisons.json — only EN and PT are here.
 * localizeComparison() merges this with the raw comparison object,
 * preserving ids, dates, images, mallIds and schema.
 */

const comparisonTranslations = {
  en: {
    "parque-arauco-vs-costanera-center": {
      title: "Parque Arauco vs Costanera Center: which one is right for you?",
      description:
        "A detailed comparison between Parque Arauco and Costanera Center: brands, dining, transport, prices and overall experience. Find out which one best suits your visit.",
      intro:
        "Parque Arauco and Costanera Center are the two most popular malls among tourists in Santiago, Chile. Both bring together international brands, great dining and enjoy a prime location in the city's east side. But they have important differences that can determine which one best fits your visit.",
      criteria: [
        {
          name: "Brands and variety",
          mallA:
            "Parque Arauco stands out for its premium offering and luxury brands: Louis Vuitton, Gucci, Ralph Lauren, Hugo Boss and Calvin Klein all have a presence here. The shopping experience is more spacious and less crowded.",
          mallB:
            "Costanera Center has a larger total number of stores and blends mid-range brands well with some international names. Zara, H&M, Mango, Bershka and Pull&Bear are among the most sought after.",
        },
        {
          name: "Dining",
          mallA:
            "Parque Arauco's dining scene is high-end, with international cuisine restaurants, signature options and a spacious food court. Ideal for combining shopping with a good meal.",
          mallB:
            "Costanera Center has a very complete dining offering with options for every budget: from the food court with international chains to upper-floor restaurants with a view.",
        },
        {
          name: "Transport and access",
          mallA:
            "Requires combining the metro with a walk, bus or a short taxi/Uber ride from nearby stations. It has ample parking for those arriving by car.",
          mallB:
            "It is the best-connected mall in Santiago: the Tobalaba metro station is just a few minutes' walk away. Ideal for tourists without a car staying in Providencia or Las Condes.",
        },
        {
          name: "Atmosphere and experience",
          mallA:
            "More relaxed, with pleasant outdoor areas and an overall more premium feel. Better if you want an unhurried afternoon of shopping.",
          mallB:
            "More lively and busy, especially on weekends and at peak hours. Good for anyone who wants to get their shopping done quickly and has little time.",
        },
        {
          name: "Additional attractions",
          mallA:
            "Close to Parque Araucano and the Las Condes restaurant district, making it easy to extend your outing.",
          mallB:
            "Sky Costanera, the highest viewpoint in South America, is in the same building. A major plus for tourists visiting the city for the first time.",
        },
      ],
      conclusion:
        "If it's your first time in Santiago and you want to make the most of your time, choose Costanera Center for its metro access and the added bonus of Sky Costanera. If you prefer a calmer experience, premium brands and great dining, Parque Arauco is the better choice.",
    },
    "easton-vs-arauco-premium-outlet": {
      title:
        "Easton Outlet Mall vs Arauco Premium Outlet: which outlet is the better bet?",
      description:
        "We compare Santiago's two big outlets: Easton Outlet Mall and Arauco Premium Outlet Buenaventura. Brands, prices, distance and what to expect from each one.",
      intro:
        "Santiago's two big outlets are both in Quilicura, a few kilometres apart from each other. Many visitors combine them on the same day. But if you only have time for one, this comparison helps you decide based on which brands you're after and what kind of experience you expect.",
      criteria: [
        {
          name: "Available brands",
          mallA:
            "Easton is strong in mainstream fashion at outlet prices: Zara Outlet, H&M Outlet, Mango Outlet, Basement and Americanino. In sportswear it has Adidas, Nike, Puma and Fila with discounts on previous collections.",
          mallB:
            "Arauco Premium aims a step higher: Polo Ralph Lauren, Tommy Hilfiger, Calvin Klein, Lacoste, Guess and Levi's. In sportswear it also has Nike, Adidas and New Balance Outlet, plus Under Armour.",
        },
        {
          name: "Price level",
          mallA:
            "The discounts at Easton are attractive in casual and sportswear. It's the more affordable of the two outlets for mid-range brands.",
          mallB:
            "Prices at Arauco Premium are higher because of the type of brands, but the discounts off the original price can be significant on brands like Ralph Lauren or Tommy Hilfiger.",
        },
        {
          name: "Dining",
          mallA:
            "A functional food court with Starbucks, McDonald's and Telepizza. It's not the highlight, but it covers a shopping day well.",
          mallB:
            "Similar to Easton's: Starbucks and Subway available. It's not a dining destination either, but it lets you recharge without leaving the premises.",
        },
        {
          name: "How to get there",
          mallA:
            "Both are in Quilicura and are best reached by car or Uber from downtown or the east side. Easton is slightly further west.",
          mallB:
            "A few minutes from Easton, also in Quilicura. If you visit both on the same day, the trip between them takes no more than 10 minutes by car.",
        },
        {
          name: "Recommended time",
          mallA:
            "3 to 5 hours to explore it at a relaxed pace. If you combine it with Arauco Premium, plan for at least 6 to 8 hours in total.",
          mallB:
            "3 to 5 hours on its own. Combining both in an 'outlet day' is a popular option well worth dedicating the whole day to.",
        },
      ],
      conclusion:
        "For casual and sportswear at the best price of the two, choose Easton. For mid-to-high-end brands like Ralph Lauren, Calvin Klein or Lacoste with outlet discounts, go for Arauco Premium. Ideally, combine them on the same day if you have the time.",
    },
  },
  pt: {
    "parque-arauco-vs-costanera-center": {
      title: "Parque Arauco vs Costanera Center: qual é o melhor para você?",
      description:
        "Comparação detalhada entre o Parque Arauco e o Costanera Center: marcas, gastronomia, transporte, preços e experiência geral. Descubra qual se adapta melhor à sua visita.",
      intro:
        "O Parque Arauco e o Costanera Center são os dois shoppings mais populares entre os turistas em Santiago, no Chile. Ambos reúnem marcas internacionais, boa gastronomia e estão muito bem localizados na zona leste da cidade. Mas têm diferenças importantes que podem definir qual se adapta melhor à sua visita.",
      criteria: [
        {
          name: "Marcas e variedade",
          mallA:
            "O Parque Arauco se destaca pela oferta premium e pelas marcas de luxo: Louis Vuitton, Gucci, Ralph Lauren, Hugo Boss e Calvin Klein estão presentes aqui. A experiência de compra é mais espaçosa e menos cheia.",
          mallB:
            "O Costanera Center tem uma quantidade maior de lojas no total e combina bem marcas de gama média com algumas internacionais. Zara, H&M, Mango, Bershka e Pull&Bear estão entre as mais procuradas.",
        },
        {
          name: "Gastronomia",
          mallA:
            "O nível gastronômico do Parque Arauco é alto, com restaurantes de cozinha internacional, opções autorais e uma praça de alimentação ampla. Ideal para combinar compras com uma boa refeição.",
          mallB:
            "O Costanera Center tem uma oferta gastronômica muito completa, com opções para todos os orçamentos: da praça de alimentação com redes internacionais até restaurantes nos andares superiores com vista.",
        },
        {
          name: "Transporte e acesso",
          mallA:
            "Exige combinar o metrô com uma caminhada, ônibus ou uma corrida curta de táxi/Uber a partir das estações próximas. Tem estacionamento amplo para quem vai de carro.",
          mallB:
            "É o shopping mais bem conectado de Santiago: a estação Tobalaba do metrô fica a poucos minutos a pé. Ideal para turistas sem carro hospedados em Providencia ou Las Condes.",
        },
        {
          name: "Ambiente e experiência",
          mallA:
            "Mais tranquilo, com áreas externas agradáveis e uma sensação geral mais premium. Melhor se você quiser uma tarde de compras sem pressa.",
          mallB:
            "Mais animado e movimentado, especialmente nos fins de semana e nos horários de pico. Bom para quem quer resolver as compras rápido e tem pouco tempo.",
        },
        {
          name: "Atrações adicionais",
          mallA:
            "Perto do Parque Araucano e do distrito de restaurantes de Las Condes, o que permite prolongar facilmente o passeio.",
          mallB:
            "O Sky Costanera, o mirante mais alto da América do Sul, fica no mesmo edifício. Um diferencial importante para turistas que visitam a cidade pela primeira vez.",
        },
      ],
      conclusion:
        "Se for sua primeira vez em Santiago e você quiser aproveitar ao máximo o tempo, escolha o Costanera Center pelo acesso de metrô e pelo bônus do Sky Costanera. Se prefere uma experiência mais tranquila, marcas premium e boa gastronomia, o Parque Arauco é a melhor opção.",
    },
    "easton-vs-arauco-premium-outlet": {
      title:
        "Easton Outlet Mall vs Arauco Premium Outlet: qual outlet vale mais a pena?",
      description:
        "Comparamos os dois grandes outlets de Santiago: Easton Outlet Mall e Arauco Premium Outlet Buenaventura. Marcas, preços, distância e o que esperar de cada um.",
      intro:
        "Os dois grandes outlets de Santiago ficam em Quilicura, a poucos quilômetros um do outro. Muitos visitantes combinam os dois no mesmo dia. Mas, se você tiver tempo só para um, esta comparação ajuda a decidir de acordo com as marcas que procura e o tipo de experiência que espera.",
      criteria: [
        {
          name: "Marcas disponíveis",
          mallA:
            "O Easton é forte em moda popular a preços de outlet: Zara Outlet, H&M Outlet, Mango Outlet, Basement e Americanino. No esporte, tem Adidas, Nike, Puma e Fila com descontos em coleções anteriores.",
          mallB:
            "O Arauco Premium aponta para um nível superior: Polo Ralph Lauren, Tommy Hilfiger, Calvin Klein, Lacoste, Guess e Levi's. No esporte, também tem Nike, Adidas e New Balance Outlet, além de Under Armour.",
        },
        {
          name: "Nível de preços",
          mallA:
            "Os descontos no Easton são atraentes em moda casual e esportiva. É a opção mais econômica entre os dois outlets para marcas de gama média.",
          mallB:
            "Os preços no Arauco Premium são mais altos por causa do tipo de marcas, mas os descontos sobre o preço original podem ser significativos em marcas como Ralph Lauren ou Tommy Hilfiger.",
        },
        {
          name: "Gastronomia",
          mallA:
            "Praça de alimentação funcional, com Starbucks, McDonald's e Telepizza. Não é o ponto forte, mas dá conta bem de um dia de compras.",
          mallB:
            "Parecida com a do Easton: Starbucks e Subway disponíveis. Também não é um destino gastronômico, mas permite recarregar as energias sem sair do local.",
        },
        {
          name: "Como chegar",
          mallA:
            "Os dois ficam em Quilicura e o acesso é melhor de carro ou Uber a partir do centro ou da zona leste. O Easton fica um pouco mais a oeste.",
          mallB:
            "A poucos minutos do Easton, também em Quilicura. Se você for aos dois no mesmo dia, o trajeto entre um e outro não passa de 10 minutos de carro.",
        },
        {
          name: "Tempo recomendado",
          mallA:
            "3 a 5 horas para percorrê-lo com calma. Se combinar com o Arauco Premium, planeje pelo menos 6 a 8 horas no total.",
          mallB:
            "3 a 5 horas separadamente. A combinação dos dois em um 'outlet day' é uma alternativa popular que merece o dia inteiro.",
        },
      ],
      conclusion:
        "Para moda casual e esportiva pelo melhor preço entre os dois, escolha o Easton. Para marcas de gama média-alta como Ralph Lauren, Calvin Klein ou Lacoste com descontos de outlet, opte pelo Arauco Premium. O ideal é combinar os dois no mesmo dia, se você tiver tempo.",
    },
  },
};

/**
 * Returns the comparison object with locale-specific prose fields merged in.
 * Falls back to the original Spanish data for es/unknown languages or missing entries.
 * Preserves ids, dates, images, mallIds and schema.
 */
export function localizeComparison(comparison, lang) {
  if (!comparison) return comparison;
  if (lang === "es" || !comparisonTranslations[lang]?.[comparison.id]) {
    return comparison;
  }
  const loc = comparisonTranslations[lang][comparison.id];
  return {
    ...comparison,
    title: loc.title ?? comparison.title,
    description: loc.description ?? comparison.description,
    intro: loc.intro ?? comparison.intro,
    criteria: (comparison.criteria ?? []).map((criterion, i) => {
      const locCriterion = loc.criteria?.[i];
      if (!locCriterion) return criterion;
      return {
        ...criterion,
        name: locCriterion.name ?? criterion.name,
        mallA: locCriterion.mallA ?? criterion.mallA,
        mallB: locCriterion.mallB ?? criterion.mallB,
      };
    }),
    conclusion: loc.conclusion ?? comparison.conclusion,
  };
}
