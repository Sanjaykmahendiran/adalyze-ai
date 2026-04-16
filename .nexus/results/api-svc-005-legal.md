# Governance Review — api-svc-005

**Date**: 2026-04-11
**Verdict**: APPROVED

---

## Risk Assessment

Sprint 5 is a pure refactoring migration — no new API endpoints, no new data collection, no new user flows. All 20 call sites being migrated already exist in production. The migration wraps existing `fetch()` calls in typed TypeScript service functions. Network behaviour is unchanged.

---

## Findings

| Item | Finding | Verdict |
|------|---------|---------|
| Policy endpoints (`privacypolicy`, `returnpolicy`, `termsandconditions`) | Return raw HTML text served to authenticated users. Fetching/caching behaviour unchanged by migration. No new legal risk introduced. | ✅ PASS |
| Geo data (`countrieslist`, `stateslist`, `citieslist`) from techades.com | Cross-origin fetch already in production. Migration does not change the request shape or CORS configuration. No data stored beyond existing browser state. | ✅ PASS |
| User support/feedback data (`userhelplist`, `userfeedbacklist`, `userexptalkreqlist`) | User-generated content scoped to authenticated user_id. Service layer accepts user_id as a parameter (not stored in service). No PII exposure introduced by migration. | ✅ PASS |
| `userId` cookie read in `feedback-form.tsx` | Already in production. Cookie is read inside the component function body (AP-001 compliant). Service function accepts `userId` as a parameter — the service itself never reads cookies. Pattern unchanged. | ✅ PASS |

---

## Constraints for Architect

1. Policy service functions return `Promise<string>` (HTML text via `.text()`), not `Promise<unknown>` — type the return correctly.
2. Service functions must accept `userId` as a parameter and never read `Cookies` internally (AP-001).
3. No new data persistence introduced anywhere in the migration.
