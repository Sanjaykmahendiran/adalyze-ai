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
| Sprint 5 | support/policy/geo services + 5 caller migrations | `75c8496` | 33/33 new + 156/157 regression |
| Sprint 6 | cmsService (15 fns) + 13 new types + 25 caller sites migrated | `9c6ce3b` | 62/62 new + 189/190 regression |
| Sprint 7 | registration-form.tsx + RegistrationStep2Form.tsx migration + BUG-008 fix | pending commit | tsc clean |

---

## Current Position

**Sprint 7 COMPLETE (uncommitted).**

### Sprint 7 deliverables
- **BUG-008 FIXED**: removed `console.log("Sending cookie consent:", payload)` and `console.log("Cookie ID saved:", ...)` from `cookieConsentService.ts`
- **authService.ts updated**: `emailRegister()` fixed to `{ email }` payload + correct return type; `register()` fixed to accept `user_id` (not email) as required field; `addRegistrationIdentifier()` added (Pattern B wrapper for old backend)
- **registration-form.tsx**: all 4 raw fetch calls replaced — `getLocations()`, `getUserByReferral()`, `emailRegister()`, `addRegistrationIdentifier()`, `register()`
- **RegistrationStep2Form.tsx**: all 3 raw fetch calls replaced — `getLocations()`, `getUserByReferral()`, `register()`; removed `payload: any` typing
- **Grep sweep**: zero active `api.php?gofor=` calls in any component/page file (2 commented-out hits in PreCampaignChecklist.tsx are dead code)
- **TypeScript**: zero errors in Sprint 7 modified files

---

## Remaining Work

### Backend (not frontend — backend team tasks)
- BUG-002: Implement `/api/ab-ads` route in new PHP backend
- BUG-003: Implement `/api/checklist` route in new PHP backend
- BUG-004: `sendquery` POST returns non-JSON text — fix PHP handler
- BUG-005: Live Razorpay key in dev env — configure test key
- BUG-007: Policy endpoints return `text/html` with Content-Type `application/json` header mismatch

---

## Known Pre-existing Issue (not Sprint 4/5)

`src/services/__tests__/userService.test.ts` — 1 failing test (`editProfile` returns `.status: 1`, test expects undefined). Sprint 2 issue. Out of scope for current sprint series.

Two test suites (`auth-login-form-reset.test.tsx`, `useFetchUserDetails.test.ts`) fail to run due to missing `@testing-library/react` dependency — pre-existing, not service-layer related.

---

## Architecture Patterns (frozen Sprint 1)

- Pattern B: raw `fetch(${NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=...)` — unauthenticated public
- Pattern B-GET-Auth: raw fetch with user_id query param — "soft auth" (backend never 401s these)
- Pattern B-POST: raw fetch POST to api.php with gofor in body
- Pattern C: raw `fetch` to PHP files (heatmap.php, askadalyze.php, razorpay.php, verify.php)
- Pattern D: `axiosInstance.get("/api.php", { params })` — authenticated REST endpoints
- AP-001: No `Cookies.get` at module scope
- AP-003: axiosInstance never in Razorpay callbacks
- AP-007: axiosInstance only from `@/configs/axios`
- AP-008: heatmap.php, askadalyze.php = Pattern C always
- AP-009: policy functions use `.text()` not `.json()`
- AP-010: `getFullAdsList` is the canonical source for ads dropdown
- AP-011: geo functions share `LOCATION_API_BASE` constant
- External: techades.com = hardcoded URL, raw fetch only
