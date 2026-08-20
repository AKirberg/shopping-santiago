---
name: Managed review schema publishing
description: How shared-review schema changes reach production in this Replit project.
---

Use Replit's managed PostgreSQL schema flow for shared-review tables: create and validate the schema in development, then let Publish present and apply the development-to-production schema diff. Do not add startup DDL or custom production migration scripts.

**Why:** Review data needs a server-backed database, while unmanaged migration code can race autoscaled instances and conflicts with the platform's schema publishing flow.

**How to apply:** When changing review persistence, update the development schema through the database tooling, validate against it locally, and review the non-destructive schema change during Publish.