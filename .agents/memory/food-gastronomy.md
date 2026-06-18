---
name: Food / Gastronomy levels in malls
description: How foodLevel field works, which malls got which level, and the filter logic.
---

## Rule
Each mall has `foodLevel: "gastronomico" | "patio"`. The `food` filter (Con comida) includes ANY mall with `foodExperience: true`. The `gastronomico` filter narrows to `foodLevel === "gastronomico"` only.

**Why:** User distinction: "patio de comidas" = basic fast food; "centro gastronómico" = real restaurants, dining experience.

## Assignments
- gastronomico (11): costanera-center, parque-arauco, alto-las-condes, casacostanera, mallplaza-egana, florida-center, mallplaza-vespucio, mallplaza-norte, mallplaza-oeste, arauco-maipu, mut-mercado-urbano-tobalaba
- patio (8): mall-sport, open-kennedy, easton-outlet-mall, arauco-premium-outlet-buenaventura, apumanque, portal-la-dehesa, feria-artesanal-los-dominicos, portal-nunoa

## UI
- MallCard: Utensils icon + label in gold (gastronomico) or muted (patio) below transport info
- MallDetail: FoodBadge component spans 2 cols in badge grid; gold bg for gastronomico
- QuickIntentButtons: "Comer / Almorzar" (UtensilsCrossed icon) → sets food:true filter
- MallFilters: "Gastronomía" toggle → sets gastronomico:true filter

## Translations
- ES: patio="Patio de comidas", gastronomico="Centro gastronómico"
- PT: patio="Praça de alimentação", gastronomico="Centro gastronômico"
- EN: patio="Food court", gastronomico="Gastronomic centre"
