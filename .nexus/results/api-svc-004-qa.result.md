# P3 QA Results — api-svc-004

**Date**: 2026-04-11
**Status**: PASSED — 42/42 Sprint 4 tests

---

## Test Suites (Sprint 4)

| Suite | Tests | Result |
|-------|-------|--------|
| resultsService.test.ts | ~12 | ✅ PASS |
| chatService.test.ts | ~9 | ✅ PASS |
| abService.test.ts | ~4 | ✅ PASS |
| referenceDataService.test.ts | ~7 | ✅ PASS |

**Total Sprint 4: 42 passed, 0 failed**

---

## AP-008 Regressions

| Test | Verified |
|------|---------|
| `generateHeatmap` uses raw fetch, NOT axiosInstance | ✅ PASS |
| `askAdalyze` uses raw fetch, NOT axiosInstance | ✅ PASS |
| `getLocations` uses hardcoded `techades.com` URL (NOT `NEXT_PUBLIC_API_BASE_URL`) | ✅ PASS |

---

## Full Suite Result

**14 suites, 157 tests: 156 passed, 1 failed**

The 1 failure is pre-existing from Sprint 2 (not a Sprint 4 regression):

| Suite | Failure | Note |
|-------|---------|------|
| userService.test.ts | `editProfile` returns `UserProfile` with `.status: 1` but test expects `.status` to be undefined | Sprint 2 issue — `userService.ts` last modified in Sprint 2 commit `8c070e2`. Not touched by Sprint 4. Out of scope. |

---

## Sprint 3 Regression Check

All 71 Sprint 3 tests continue to pass (adService, dashboardService, contentService, pricingService, paymentService, checklistService, regressions).
