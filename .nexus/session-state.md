# Session State — adalyze-ai api-layer migration

**Last updated**: 2026-04-11
**Current branch**: develop

---

## Sprint History

| Sprint | Scope | Commit | Tests |
|--------|-------|--------|-------|
| Sprint 1 | Auth service layer foundation | `d212dc2` | — |
| Sprint 2 | Brand, upload, user services + 10 caller migrations | `8c070e2` | — |
| Sprint 3 | ad, dashboard, content, pricing, payment, checklist services | `c878ea3` | 71/71 |
| Sprint 4 | results, chat, A/B, reference data services | `44c8f7d` | 42/42 new + 71/71 regression |

---

## Current Position

**Sprint 4 COMPLETE.**

All P1 → P2 → P3 stages done. 19 files committed.

---

## Remaining Work

### Sprint 5 (next)
Target files with remaining `api.php?gofor=` calls:
- `src/app/support/page.tsx`
- `src/app/interact/page.tsx` (or interact.tsx)
- `src/app/myprofile/` (profile page gofor calls)

### Sprint 6
- CMS/landing content pages
- Blog pages
- Final `grep -rn "api.php?gofor="` sweep + TypeScript verification

---

## Known Pre-existing Issue (not Sprint 4)

`src/services/__tests__/userService.test.ts` — 1 failing test (`editProfile` returns `.status: 1`, test expects undefined). Sprint 2 issue. Out of scope for current sprint series.

---

## Architecture Patterns (frozen Sprint 1)

- Pattern B: raw `fetch(${NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=...)` — unauthenticated public
- Pattern C: raw `fetch` to PHP files (heatmap.php, askadalyze.php, razorpay.php, verify.php)
- Pattern D: `axiosInstance.get("/api.php", { params })` — authenticated gofor
- AP-001: No `Cookies.get` at module scope
- AP-003: axiosInstance never in Razorpay callbacks
- AP-007: axiosInstance only from `@/configs/axios`
- AP-008: heatmap.php, askadalyze.php = Pattern C always
- External: techades.com = hardcoded URL, raw fetch only
