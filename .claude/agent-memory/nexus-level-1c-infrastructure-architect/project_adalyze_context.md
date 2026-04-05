---
name: Adalyze AI project context
description: Platform stack, hosting model, and Fix Engine POC scope
type: project
---

Adalyze AI runs on cPanel shared hosting (PHP monolith backend at adalyzeai.xyz/App/). Frontend is Next.js 15 with `output: 'export'` (static export — pre-built HTML/JS/CSS, served as static files). Fix Engine POC adds async cron-based pipeline: Claude Vision → Nano Banana image gen → re-analysis via analyze.php.

**Why:** cPanel max_execution_time cap (likely 30s) forces async design; no daemon processes means cron-only background work.

**How to apply:** All infrastructure recommendations must work within cPanel shared hosting constraints. No containers, no persistent workers, no WebSockets. Cron + polling is the architectural primitive.
