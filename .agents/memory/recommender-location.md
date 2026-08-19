---
name: Recommender location
description: UX rule for the mall recommendation flow and the shared location input.
---

The mall recommender depends on the confirmed address/location set in the shared top location bar. It must not present a separate “Where are you?” or zone-choice control.

**Why:** Asking twice creates an inconsistent experience and can rank results from a location other than the one the visitor already entered.

**How to apply:** Without confirmed coordinates and an address, show an explicit location-required state and direct the visitor to the shared address input. Once set, display that address in the recommender and rank by distance.