---
name: Adalyze hardcoded production URL problem
description: 54 frontend source files hardcode adalyzeai.xyz directly — major dev isolation risk
type: project
---

54 files in src/ contain hardcoded `https://adalyzeai.xyz/App/` URLs. The axios instance uses `process.env.API_BASE_URL` (good), but `next.config.mjs` bakes `API_BASE_URL` as a compile-time constant to `https://adalyzeai.xyz/App/api.php`. Many files bypass the axios instance and call `fetch('https://adalyzeai.xyz/App/...')` directly.

Key offenders: upload/page.tsx (adupl.php, api.php calls), results pages, login, brands, etc.

**Why this matters:** Any static export of the frontend will always call production backend regardless of subdomain, unless next.config.mjs is changed before the build and the built output is re-deployed.

**How to apply:** Dev environment plan must include a separate Next.js build step with `API_BASE_URL` pointed at `dev.adalyzeai.xyz/App/` before exporting static files. The plan's P0.1 as written does not address this — it only covers PHP/DB, not the frontend rebuild requirement.
