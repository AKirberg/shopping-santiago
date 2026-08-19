---
name: Recommender category selection
description: Rules for allowing and scoring multiple shopping categories in the mall recommender.
---

The shopping-category prompt supports multiple simultaneous choices and keeps at least one category selected. Rank malls by whether they match any selected category, while preserving specialized boosts such as outlet relevance.

**Why:** Visitors commonly combine shopping goals, such as clothing and sneakers, and should not have to choose a single artificial preference.

**How to apply:** Treat category answers as an array in recommender logic, while accepting a scalar category for backward compatibility where relevant.