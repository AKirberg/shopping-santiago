---
name: Integrated historical mall URLs
description: How to preserve a historical mall URL when the official operator no longer treats it as a separate destination.
---

Keep the historical URL, canonical and hreflang for compatibility, but represent the page as an informational `WebPage` linked to the current parent mall. Do not emit an independent `ShoppingCenter`, address, geolocation or destination classifications, and exclude it from directories and recommendations.

**Why:** Removing or redirecting the established URL would violate the project’s SEO-stability requirement, while continuing to describe it as a separate mall would create a duplicate, factually unsupported entity.

**How to apply:** Use this pattern whenever an audited mall name survives in the URL canon but the current official source presents its offer only as part of another center.