---
name: Mall Maps destinations
description: Durable rule for keeping external Google Maps destinations accurate.
---

Use verified `lat` and `lng` coordinates as the primary destination for every mall's outbound Google Maps link, with a full street-address query only as fallback.

**Why:** Place-name searches can resolve to a different branch, a neighborhood, or an unrelated business; coordinates make the “Ir” action deterministic for visitors.

**How to apply:** When adding or editing a mall, verify its coordinates against an authoritative or map source and keep the full address-style map query current. Route links should reuse those same coordinates.