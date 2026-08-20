/**
 * Locale-specific editorial prose for each guide.
 * ES content lives in guides.json — only EN and PT are here.
 * localizeGuide() merges this with the raw guide object,
 * preserving ids, dates, images, relations and schema.
 */

const guideTranslations = {
  en: {
    "donde-comprar-en-santiago": {
      title: "Where to shop in Santiago: a complete guide to malls and shopping districts",
      description:
        "An editorial guide to the best shopping centres in Santiago de Chile, chosen by neighbourhood, budget and time available. It covers premium malls, family-friendly options and alternatives by district.",
      sections: [
        {
          heading: "The malls most visited by tourists",
          body: "Santiago has more than 25 active shopping centres. For a first visit, Costanera Center in Providencia and Parque Arauco in Las Condes are the two most recommended starting points: both bring together international brands, a strong dining scene and easy access from the main tourist accommodation areas.",
        },
        {
          heading: "Eastern district: Las Condes and Vitacura",
          body: "The Kennedy corridor holds the city's largest concentration of premium offerings. Parque Arauco, Alto Las Condes and Casacostanera form a natural circuit for anyone after international brands, high-end dining and a more relaxed shopping experience. Mall Sport rounds out this circuit for those looking for sportswear or outdoor gear.",
        },
        {
          heading: "Southern and south-eastern districts",
          body: "Florida Center and Mallplaza Vespucio are the most complete options in the south-east. Both have a metro connection and good variety. For the western side, Mallplaza Alameda and Mall Arauco Maipú cover a wide range of shopping needs with convenient access.",
        },
        {
          heading: "More affordable and local options",
          body: "For everyday shopping or a smaller budget, Mallplaza Norte in Independencia, Paseo Quilín in Macul and neighbourhood formats such as Apumanque in Las Condes are practical choices that also let you get a feel for local life in each area.",
        },
      ],
    },
    "outlets-en-santiago": {
      title: "Outlets in Santiago: a guide to shopping at a discount",
      description:
        "Everything about Santiago de Chile's outlets: Easton Outlet Mall and Arauco Premium Outlet Buenaventura. How to get there, which brands to find and when to go to make the most of the discounts.",
      sections: [
        {
          heading: "What an outlet is and how it works in Chile",
          body: "Outlets in Chile sell clothing, footwear and accessories from previous seasons with discounts of between 30% and 70% off the in-store price. Unlike traditional malls, the experience is entirely geared towards hunting for deals: go with plenty of time and, if possible, a list of the brands you're interested in.",
        },
        {
          heading: "Easton Outlet Mall (Quilicura)",
          body: "Easton is one of Santiago's two big outlets. It sits in Quilicura, to the north-west of the city, and is best reached by car or Uber. It brings together fashion and sports brands such as Zara Outlet, H&M Outlet, Adidas Outlet, Nike Outlet and Puma Outlet, along with casual clothing stores like Basement and Americanino. The food court is functional, though it isn't the main draw.",
        },
        {
          heading: "Arauco Premium Outlet Buenaventura (Quilicura)",
          body: "A few minutes from Easton you'll find the Arauco Premium Outlet, which leans towards mid- to high-end brands: Polo Ralph Lauren, Tommy Hilfiger, Calvin Klein, Lacoste and Guess are among the most sought after. It also has Nike and Adidas Outlet, Skechers and Swarovski. It's the closest thing here to what other countries call a premium factory outlet.",
        },
        {
          heading: "Tips for your outlet visit",
          body: "Plan on at least 4 to 6 hours if you want to visit both outlets. Confirm the official opening hours before you head out, as they can vary by season. Bring both cash and a card, check each store's exchange and returns policy, and consider going on a weekday to avoid the heavier weekend crowds.",
        },
      ],
    },
    "compras-en-santiago-para-turistas": {
      title: "Shopping in Santiago for tourists: what to buy, where and how to get around",
      description:
        "A practical guide for tourists visiting Santiago who want to buy clothing, souvenirs, technology or handicrafts. It includes transport tips, recommended districts and what to expect from Chilean malls.",
      sections: [
        {
          heading: "Why Santiago is a good shopping destination",
          body: "Santiago has the widest range of shopping in Chile and one of the most complete in South America. The malls are modern, safe and well connected by metro. You'll find international brands such as Zara, H&M, Nike, Adidas, Calvin Klein and Tommy Hilfiger at prices that can be competitive with other countries in the region, especially for European brands and at the outlets.",
        },
        {
          heading: "What to buy in Santiago",
          body: "The most popular purchases among tourists include clothing and footwear from international brands, technology (especially at Costanera Center and Alto Las Condes), cosmetics at stores like Sephora, and local products such as wine, Mapuche handicrafts and textiles in the downtown markets. For more authentic souvenirs, the Mercado Central, the Vega Central and the Bellavista neighbourhood are a great complement to the mall circuit.",
        },
        {
          heading: "How to get around between malls",
          body: "The Santiago metro connects directly to Costanera Center (Tobalaba station), Mallplaza Vespucio (Bellavista de La Florida station) and Florida Center (Mirador station). For Mallplaza Norte, Parque Arauco, Alto Las Condes and Casacostanera it's best to combine the metro with a bus, Uber or taxi. The Quilicura outlets are best reached by car or a direct Uber.",
        },
        {
          heading: "Practical tips",
          body: "Malls in Chile typically open from 10:00 to 21:00 on weekdays and until 22:00 at weekends, though it's worth confirming on each mall's official site. For payments, most stores accept international Visa and Mastercard cards. The busiest sale seasons are January–February and July.",
        },
      ],
    },
    "galerias-del-centro-de-santiago": {
      title: "The arcades of downtown Santiago: local shopping and urban culture",
      description:
        "The shopping arcades of Santiago's historic centre are an authentic alternative to the modern malls. Local clothing, second-hand goods, used technology and plenty of urban colour.",
      sections: [
        {
          heading: "The downtown arcades as a cultural experience",
          body: "Unlike the big malls of the eastern district, the arcades of Santiago's historic centre offer a more local and authentic shopping experience. They are indoor passages lined with small shops selling everything from clothing and footwear to technology, collectors' items, services and popular fast food. Wandering through them is part of the atmosphere of the city centre itself.",
        },
        {
          heading: "The main arcades and what to find",
          body: "Galería España, near the Alameda, is a go-to for used technology and accessories. Pasaje Matte and Pasaje Phillips in the micro-centre are packed with clothing, shoe and handicraft shops. The Paseo Ahumada and Paseo Huérfanos area links several arcades with a varied offering. Mallplaza Alameda is the more formal version of this district, with chain stores and a cinema.",
        },
        {
          heading: "Handicrafts and local products",
          body: "For Chilean handicrafts, the Centro Artesanal Los Dominicos in Las Condes and the Mercado Central are the best-known spots. Downtown, the Feria Artesanal at the Plaza de Armas and the stalls in the Lastarria neighbourhood offer products aimed more at tourists, including textiles, carved wood and Mapuche-motif ceramics.",
        },
        {
          heading: "How to get there and when to go",
          body: "The historic centre is accessible from several metro stations: Plaza de Armas, Santa Lucía, Universidad de Chile and Baquedano. It's best to go on a weekday morning to avoid the biggest crowds. Weekends have a different feel: quieter in some areas, though some arcades keep reduced hours.",
        },
      ],
    },
  },
  pt: {
    "donde-comprar-en-santiago": {
      title: "Onde comprar em Santiago: guia completo de shoppings e zonas comerciais",
      description:
        "Guia editorial com os melhores shoppings de Santiago do Chile de acordo com a sua zona, o seu orçamento e o tempo disponível. Inclui shoppings premium, opções para a família e alternativas por bairro.",
      sections: [
        {
          heading: "Os shoppings mais visitados pelos turistas",
          body: "Santiago tem mais de 25 shoppings em funcionamento. Para uma primeira visita, o Costanera Center, em Providencia, e o Parque Arauco, em Las Condes, são os dois pontos de partida mais recomendados: ambos reúnem marcas internacionais, boa oferta gastronômica e fácil acesso a partir das principais zonas de hospedagem turística.",
        },
        {
          heading: "Zona leste: Las Condes e Vitacura",
          body: "O eixo Kennedy concentra a maior oferta premium da cidade. Parque Arauco, Alto Las Condes e Casacostanera formam um circuito natural para quem busca marcas internacionais, gastronomia de alto nível e uma experiência de compra mais tranquila. O Mall Sport complementa esse circuito para quem procura roupa esportiva ou equipamento outdoor.",
        },
        {
          heading: "Zona sul e sudeste",
          body: "Florida Center e Mallplaza Vespucio são as opções mais completas do sudeste. Ambos têm conexão de metrô e boa variedade. Para a zona oeste, Mallplaza Alameda e Mall Arauco Maipú atendem bem às necessidades de compras variadas, com acesso conveniente.",
        },
        {
          heading: "Opções mais acessíveis e locais",
          body: "Para compras mais cotidianas ou com orçamento menor, Mallplaza Norte, em Independencia, Paseo Quilín, em Macul, e formatos de bairro como o Apumanque, em Las Condes, são opções práticas que também permitem conhecer a vida local de cada zona.",
        },
      ],
    },
    "outlets-en-santiago": {
      title: "Outlets em Santiago: guia para comprar com desconto",
      description:
        "Tudo sobre os outlets de Santiago do Chile: Easton Outlet Mall e Arauco Premium Outlet Buenaventura. Como chegar, quais marcas encontrar e quando ir para aproveitar melhor os descontos.",
      sections: [
        {
          heading: "O que é um outlet e como funciona no Chile",
          body: "Os outlets no Chile vendem roupas, calçados e acessórios de temporadas anteriores com descontos de 30% a 70% sobre o preço de loja. Ao contrário dos shoppings tradicionais, a experiência é totalmente voltada para a caça às ofertas: vá com tempo e, se possível, com uma lista das marcas que lhe interessam.",
        },
        {
          heading: "Easton Outlet Mall (Quilicura)",
          body: "O Easton é um dos dois grandes outlets de Santiago. Fica em Quilicura, na zona noroeste da cidade, e o melhor acesso é de carro ou Uber. Reúne marcas de moda e esporte como Zara Outlet, H&M Outlet, Adidas Outlet, Nike Outlet e Puma Outlet, além de lojas de roupa casual como Basement e Americanino. A praça de alimentação é funcional, embora não seja o ponto forte.",
        },
        {
          heading: "Arauco Premium Outlet Buenaventura (Quilicura)",
          body: "A poucos minutos do Easton está o Arauco Premium Outlet, voltado a marcas de gama média-alta: Polo Ralph Lauren, Tommy Hilfiger, Calvin Klein, Lacoste e Guess estão entre as mais procuradas. Também tem Nike e Adidas Outlet, Skechers e Swarovski. É a opção mais próxima do que em outros países se chama de factory outlet premium.",
        },
        {
          heading: "Dicas para a sua visita aos outlets",
          body: "Planeje o dia com pelo menos 4 a 6 horas disponíveis se quiser visitar os dois outlets. Confirme os horários oficiais antes de sair, pois podem variar conforme a temporada. Leve dinheiro e cartão, verifique as políticas de troca e devolução de cada loja e considere ir durante a semana para evitar o maior movimento dos fins de semana.",
        },
      ],
    },
    "compras-en-santiago-para-turistas": {
      title: "Compras em Santiago para turistas: o que comprar, onde e como se locomover",
      description:
        "Guia prático para turistas que visitam Santiago e querem comprar roupas, lembranças, tecnologia ou artesanato. Inclui dicas de transporte, zonas recomendadas e o que esperar dos shoppings chilenos.",
      sections: [
        {
          heading: "Por que Santiago é um bom destino de compras",
          body: "Santiago concentra a maior oferta comercial do Chile e uma das mais completas da América do Sul. Os shoppings são modernos, seguros e bem conectados por metrô. Você vai encontrar marcas internacionais como Zara, H&M, Nike, Adidas, Calvin Klein e Tommy Hilfiger a preços que podem ser competitivos em relação a outros países da região, especialmente em marcas europeias e nos outlets.",
        },
        {
          heading: "O que comprar em Santiago",
          body: "As compras mais populares entre os turistas incluem roupas e calçados de marcas internacionais, tecnologia (sobretudo no Costanera Center e no Alto Las Condes), cosméticos em lojas como a Sephora e produtos locais como vinho, artesanato mapuche e têxteis nos mercados do centro. Para lembranças mais autênticas, o Mercado Central, a Vega Central e o bairro Bellavista complementam bem o circuito dos shoppings.",
        },
        {
          heading: "Como se locomover entre os shoppings",
          body: "O metrô de Santiago conecta diretamente com o Costanera Center (estação Tobalaba), o Mallplaza Vespucio (estação Bellavista de La Florida) e o Florida Center (estação Mirador). Para Mallplaza Norte, Parque Arauco, Alto Las Condes e Casacostanera, o ideal é combinar metrô com ônibus, Uber ou táxi. Os outlets de Quilicura são mais bem acessados de carro ou por Uber direto.",
        },
        {
          heading: "Dicas práticas",
          body: "Os shoppings no Chile costumam abrir das 10h às 21h nos dias de semana e até as 22h nos fins de semana, embora convenha confirmar no site oficial de cada um. Para pagamentos, a maioria das lojas aceita cartões internacionais Visa e Mastercard. A temporada de liquidações mais intensa é de janeiro a fevereiro e em julho.",
        },
      ],
    },
    "galerias-del-centro-de-santiago": {
      title: "Galerias do centro de Santiago: compras locais e cultura urbana",
      description:
        "As galerias comerciais do centro histórico de Santiago são uma alternativa autêntica aos shoppings modernos. Roupa local, artigos de segunda mão, tecnologia usada e muita cor urbana.",
      sections: [
        {
          heading: "As galerias do centro como experiência cultural",
          body: "Ao contrário dos grandes shoppings da zona leste, as galerias do centro histórico de Santiago oferecem uma experiência de compra mais local e autêntica. São passagens internas com pequenas lojas que vendem de tudo, de roupas e calçados a tecnologia, artigos de colecionador, serviços e comida rápida popular. Percorrê-las faz parte do ambiente próprio do centro da cidade.",
        },
        {
          heading: "Principais galerias e o que encontrar",
          body: "A Galería España, perto da Alameda, é referência para tecnologia usada e acessórios. O Pasaje Matte e o Pasaje Phillips, no microcentro, concentram lojas de roupa, sapataria e artesanato. A zona do Paseo Ahumada e do Paseo Huérfanos liga várias galerias com oferta variada. O Mallplaza Alameda é a versão mais formal dessa zona, com lojas de rede e cinema.",
        },
        {
          heading: "Artesanato e produtos locais",
          body: "Para artesanato chileno, o Centro Artesanal Los Dominicos, em Las Condes, e o Mercado Central são os pontos mais reconhecidos. No centro, a Feira Artesanal da Plaza de Armas e os estandes do bairro Lastarria oferecem produtos mais voltados ao turista, incluindo tecidos, madeira entalhada e cerâmica com motivos mapuche.",
        },
        {
          heading: "Como chegar e quando ir",
          body: "O centro histórico é acessível a partir de várias estações de metrô: Plaza de Armas, Santa Lucía, Universidad de Chile e Baquedano. O ideal é ir durante a semana, no período da manhã, para evitar a maior concentração de gente. No fim de semana o ambiente é diferente: mais tranquilo em algumas zonas, mas com algumas galerias em horário reduzido.",
        },
      ],
    },
  },
};

/**
 * Returns the guide object with locale-specific editorial fields merged in.
 * Preserves ids, dates, images, relations and schema.
 * Falls back to the original Spanish data for es/unknown languages.
 */
export function localizeGuide(guide, lang) {
  if (!guide) return guide;
  if (lang === "es" || !guideTranslations[lang]?.[guide.id]) return guide;
  const loc = guideTranslations[lang][guide.id];
  return {
    ...guide,
    title:       loc.title       ?? guide.title,
    description: loc.description ?? guide.description,
    sections: Array.isArray(guide.sections)
      ? guide.sections.map((section, i) => ({
          ...section,
          heading: loc.sections?.[i]?.heading ?? section.heading,
          body:    loc.sections?.[i]?.body    ?? section.body,
        }))
      : guide.sections,
  };
}
