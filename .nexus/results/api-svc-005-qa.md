# P3 QA Results — api-svc-005

**Date**: 2026-04-11
**Status**: PASSED — 33/33 Sprint 5 tests

---

## Test Suite (Sprint 5)

| Suite | Tests | Result |
|-------|-------|--------|
| supportService.test.ts | 33 | ✅ PASS |

**Total Sprint 5: 33 passed, 0 failed**

---

## AP-009 Regression Check (Policy functions use .text() not .json())

| Test | Verified |
|------|---------|
| `getPrivacyPolicy` returns raw text string | ✅ PASS |
| `getReturnPolicy` returns raw text string | ✅ PASS |
| `getTermsAndConditions` returns raw text string | ✅ PASS |

---

## Full Suite Result

**17 suites, 190 tests: 189 passed, 1 failed**

The 1 failure is pre-existing from Sprint 2 (not a Sprint 5 regression):

| Suite | Failure | Note |
|-------|---------|------|
| userService.test.ts | `editProfile` returns `UserProfile` with `.status: 1` but test expects `.status` to be undefined | Sprint 2 issue — last modified in Sprint 2 commit `8c070e2`. Not touched by Sprint 5. Out of scope. |

Two additional suites (`auth-login-form-reset.test.tsx`, `useFetchUserDetails.test.ts`) fail to run due to missing `@testing-library/react` dependency — pre-existing, not related to the service layer migration.

---

## Sprint 3–4 Regression Check

All 71 Sprint 3 tests and 42 Sprint 4 tests continue to pass (confirmed by full suite run: 189/190 total, same 1 pre-existing failure as Sprint 4).
