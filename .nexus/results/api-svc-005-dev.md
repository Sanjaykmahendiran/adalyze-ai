# P3 Dev Results — api-svc-005

**Date**: 2026-04-11
**Status**: PASSED — build clean, 0 errors

---

## Files Modified / Created

### New Service Files

| File | Functions | Patterns |
|------|-----------|---------|
| `src/services/supportService.ts` | `getFullAdsList`, `getUserHelpList`, `getUserFeedbackList`, `getUserExpertTalkList`, `getPrivacyPolicy`, `getReturnPolicy`, `getTermsAndConditions`, `submitSupportRequest`, `submitFeedback`, `submitExpertCallRequest` | B-GET-Auth (×4), B (×3), B-POST (×3) |

### Extended Service Files

| File | Addition |
|------|---------|
| `src/services/contentService.ts` | `getFaqsFiltered` (Pattern B) |
| `src/services/referenceDataService.ts` | `getCountries`, `getStates`, `getCities` (all Pattern B via `LOCATION_API_BASE`) |

### Caller Files Updated

| File | Edits | Inline fetch calls removed |
|------|-------|--------------------------|
| `src/app/support/page.tsx` | 8 | `faqlist`, `fulladsnamelist`, `needhelp POST`, `exptalkrequest POST`, `feedback POST` |
| `src/app/myaccount/_components/policies.tsx` | 2 | `privacypolicy`, `returnpolicy`, `termsandconditions` |
| `src/app/myaccount/_components/MyProfile.tsx` | 4 | `countrieslist`, `stateslist`, `citieslist` |
| `src/app/myaccount/_components/feedback-form.tsx` | 4 | `fulladsnamelist`, `feedback POST` |
| `src/app/myaccount/_components/interact.tsx` | 8 | `userhelplist`, `userfeedbacklist`, `userexptalkreqlist`, `fulladsnamelist`, `needhelp POST`, `feedback POST`, `exptalkrequest POST` |

### Types Added

`src/types/api.ts` — appended after `LocationResult`:
`SupportAd`, `SupportAdListResponse`, `SupportItem`, `FeedbackItem`, `ExpertTalkItem`, `UserListResponse<T>`, `SupportRequestPayload`, `FeedbackPayload`, `ExpertCallPayload`, `GeoItem`

---

## Architecture Compliance

| Pattern | Applied | Notes |
|---------|---------|-------|
| AP-001 (no module-scope Cookies) | ✅ | All service functions accept `userId` as param; `Cookies.get` stays in component body |
| AP-009 (policy functions use `.text()`) | ✅ | `getPrivacyPolicy`, `getReturnPolicy`, `getTermsAndConditions` return `Promise<string>` |
| AP-010 (`getFullAdsList` is canonical) | ✅ | Both `feedback-form.tsx` and `interact.tsx` call `getFullAdsList` |
| AP-011 (geo functions share `LOCATION_API_BASE`) | ✅ | `LOCATION_API_BASE` constant used in all 3 geo functions |
| No axiosInstance in supportService | ✅ | All functions use raw `fetch` (Pattern B / B-POST) |

---

## Build Result

```
✓ Compiled successfully in 14.0s
✓ Generating static pages (48/48)
0 errors, 0 type errors
```
