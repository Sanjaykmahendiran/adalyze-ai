# BA Spec — api-svc-005

**Sprint**: 5 — Support, Policies, Profile, Interact services
**Date**: 2026-04-11

---

## Sprint Boundary

### In Scope

- `src/app/support/page.tsx` — all raw `fetch` calls
- `src/app/myaccount/_components/policies.tsx` — all raw `fetch` calls
- `src/app/myaccount/_components/MyProfile.tsx` — all raw `fetch` calls (geo data)
- `src/app/myaccount/_components/feedback-form.tsx` — all raw `fetch` calls
- `src/app/myaccount/_components/interact.tsx` — all raw `fetch` calls
- Creating `src/services/supportService.ts` (new)
- Extending `src/services/referenceDataService.ts` with 3 geo functions
- Extending `src/services/contentService.ts` with a parameterised FAQ function

### Out of Scope

- `src/components/expert-form.tsx` — shared popup component; its internal fetch calls (if any) are not surveyed in this sprint
- Any admin-facing endpoints (only user-facing call sites are included)
- TypeScript type definitions (`src/types/api.ts`) beyond what the Architect determines is needed — type authoring is the Architect/Lead's responsibility
- `interact.tsx` reload fetches that repeat `userhelplist`, `userfeedbacklist`, and `userexptalkreqlist` inline after a successful mutation — these are secondary GET calls within mutation handlers, not independent fetch sites; they are consolidated into the same service functions as the primary GETs
- UI layout, routing, or state management changes

---

## Call Site Inventory

| # | File | Line(s) | gofor / endpoint | Method | Pattern | Auth? | Notes | Proposed Service |
|---|------|---------|-----------------|--------|---------|-------|-------|-----------------|
| 1 | `support/page.tsx` | 99–100 | `faqlist&category=...&search=...` | GET | B | No | Passes `category` and `search` params. Existing `getFaqs()` in contentService sends bare `faqlist` with no params. These are different call shapes. | Extend `contentService.ts` → `getFaqsFiltered(category, search)` |
| 2 | `support/page.tsx` | 120–121 | `fulladsnamelist&user_id=` | GET | D* | Yes (user_id in URL) | `user_id` taken from `Cookies.get('userId')` at call time (not module scope — AP-001 compliant). Appears as Pattern B URL shape but carries user identity; must be Pattern D (axiosInstance, params object). | `supportService.ts` → `getFullAdsList(userId)` |
| 3 | `support/page.tsx` | 149–162 | `needhelp` | POST | B** | Soft | POST body includes `user_id`. Pattern B URL shape (`NEXT_PUBLIC_API_BASE_URL/api.php`), JSON body. No Authorization header. Consistent with prior POST patterns in sprint 3/4. | `supportService.ts` → `submitSupportRequest(payload)` |
| 4 | `support/page.tsx` | 181–193 | `exptalkrequest` | POST | B** | Soft | POST body includes `user_id`. Same shape as #3. | `supportService.ts` → `submitExpertCallRequest(payload)` |
| 5 | `support/page.tsx` | 216–229 | `feedback` | POST | B** | Soft | POST body includes `user_id`, `ad_upload_id`, `rating`, `comments`. Same shape as #3. | `supportService.ts` → `submitFeedback(payload)` |
| 6 | `policies.tsx` | 41–44 | `privacypolicy` | GET | B | No | Returns HTML text (`res.text()`), not JSON. | `supportService.ts` → `getPrivacyPolicy()` |
| 7 | `policies.tsx` | 41–44 | `returnpolicy` | GET | B | No | Returns HTML text (`res.text()`), not JSON. | `supportService.ts` → `getReturnPolicy()` |
| 8 | `policies.tsx` | 41–44 | `termsandconditions` | GET | B | No | Returns HTML text (`res.text()`), not JSON. | `supportService.ts` → `getTermsAndConditions()` |
| 9 | `MyProfile.tsx` | 309 | `https://techades.com/App/api.php?gofor=countrieslist` | GET | External | No | Hardcoded techades.com domain. Returns `[{id, name}]`. | Extend `referenceDataService.ts` → `getCountries()` |
| 10 | `MyProfile.tsx` | 332 | `https://techades.com/App/api.php?gofor=stateslist&country_id=` | GET | External | No | Parameterised by `country_id`. Returns `[{id, name}]`. | Extend `referenceDataService.ts` → `getStates(countryId)` |
| 11 | `MyProfile.tsx` | 370 | `https://techades.com/App/api.php?gofor=citieslist&state_id=` | GET | External | No | Parameterised by `state_id`. Returns `[{id, name}]`. | Extend `referenceDataService.ts` → `getCities(stateId)` |
| 12 | `feedback-form.tsx` | 55–56 | `fulladsnamelist&user_id=` | GET | D* | Yes (user_id in URL) | Identical call shape to #2. `userId` read from `Cookies.get('userId')` at component init (line 38) — AP-001 note: cookie read at component-function scope on render, not at module scope. Acceptable. | `supportService.ts` → `getFullAdsList(userId)` (reuse same function) |
| 13 | `feedback-form.tsx` | 75–85 | `feedback` | POST | B** | Soft | Identical call shape to #5. | `supportService.ts` → `submitFeedback(payload)` (reuse) |
| 14 | `interact.tsx` | 247 | `userhelplist&user_id=` | GET | D* | Yes (user_id in URL) | Called via `Promise.all` on mount. | `supportService.ts` → `getUserHelpList(userId)` |
| 15 | `interact.tsx` | 248 | `userfeedbacklist&user_id=` | GET | D* | Yes (user_id in URL) | Called via `Promise.all` on mount. | `supportService.ts` → `getUserFeedbackList(userId)` |
| 16 | `interact.tsx` | 249 | `userexptalkreqlist&user_id=` | GET | D* | Yes (user_id in URL) | Called via `Promise.all` on mount. | `supportService.ts` → `getUserExpertTalkList(userId)` |
| 17 | `interact.tsx` | 274 | `fulladsnamelist&user_id=` | GET | D* | Yes (user_id in URL) | Identical to #2/#12. | `supportService.ts` → `getFullAdsList(userId)` (reuse) |
| 18 | `interact.tsx` | 294–307 | `needhelp` | POST | B** | Soft | Identical to #3. Inline reload of `userhelplist` after success (line 314) is secondary — covered by #14. | `supportService.ts` → `submitSupportRequest(payload)` (reuse) |
| 19 | `interact.tsx` | 338–348 | `feedback` | POST | B** | Soft | Identical to #5/#13. Inline reload of `userfeedbacklist` after success (line 355) is secondary — covered by #15. | `supportService.ts` → `submitFeedback(payload)` (reuse) |
| 20 | `interact.tsx` | 371–383 | `exptalkrequest` | POST | B** | Soft | Identical to #4. Inline reload of `userexptalkreqlist` after success (line 389) is secondary — covered by #16. | `supportService.ts` → `submitExpertCallRequest(payload)` (reuse) |

**Pattern footnotes:**
- `D*` — URL carries `user_id` query param, making this an authenticated data request even though the shape is a GET URL. The Architect must decide whether to use `axiosInstance.get("/api.php", { params })` (Pattern D) or raw fetch with explicit `user_id`. Sprint 1–4 precedent for user_id-parameterised GETs should be consulted.
- `B**` — POST to `NEXT_PUBLIC_API_BASE_URL/api.php` with JSON body including `user_id`. No Authorization header is used. Consistent with sprint 3/4 mutation patterns (Pattern B POST). No axiosInstance involvement.

---

## Service File Plan

| Service File | Action | Functions |
|-------------|--------|-----------|
| `src/services/supportService.ts` | CREATE | `getFullAdsList(userId: string)` · `getUserHelpList(userId: string)` · `getUserFeedbackList(userId: string)` · `getUserExpertTalkList(userId: string)` · `getPrivacyPolicy()` · `getReturnPolicy()` · `getTermsAndConditions()` · `submitSupportRequest(payload)` · `submitFeedback(payload)` · `submitExpertCallRequest(payload)` |
| `src/services/contentService.ts` | EXTEND | Add `getFaqsFiltered(category: string, search: string)` — existing `getFaqs()` remains unchanged for landing page use |
| `src/services/referenceDataService.ts` | EXTEND | Add `getCountries()` · `getStates(countryId: string)` · `getCities(stateId: string)` — all use `LOCATION_API_BASE` constant already declared in the file |

**Decision on `faqlist` with params:** The existing `getFaqs()` in `contentService.ts` hits `gofor=faqlist` with no query params and is used by the landing/home page. The `support/page.tsx` call is functionally different: it always passes `category` and conditionally passes `search`. These two call shapes must not be merged into one function with optional params because the callers have different UX contracts (one is a filter-on-demand, the other is a bare load). A new function `getFaqsFiltered` is the correct approach, leaving the existing `getFaqs()` intact.

**Decision on geo calls:** The 3 techades.com geo endpoints (`countrieslist`, `stateslist`, `citieslist`) are a natural extension of `referenceDataService.ts`. That file already declares `LOCATION_API_BASE = "https://techades.com/App/api.php"` and the header comment establishes it as the home for external-domain raw fetch calls. A separate `geoService.ts` is not warranted — the constant and the comment already anticipated this expansion. The Architect should confirm this placement holds given the file's own caveat against mixing Pattern D calls into it.

---

## User Stories

### US-001 — Support FAQ Fetch with Filters

**As a** support page visitor,
**I want** the FAQ list to reload when I change the category or type a search term,
**so that** I see only the FAQs relevant to my current filter.

**Acceptance Criteria:**

- Given the support page loads, When the component mounts with a default category and empty search, Then `getFaqsFiltered(category, "")` is called and the FAQ list is populated
- Given a category is selected, When the category changes, Then `getFaqsFiltered(newCategory, currentSearch)` is called
- Given a search term is typed, When the search term reaches 3 or more characters, Then `getFaqsFiltered(currentCategory, searchTerm)` is called
- Given a search term of fewer than 3 characters, When the user is mid-type, Then no fetch is made and the FAQ list is cleared
- Given the service call succeeds, When data is returned, Then `faqs` state is set to the returned array
- Given the service call fails, When an error is thrown, Then `faqs` state is set to `[]` and the error is logged

---

### US-002 — Full Ads Name List (Feedback Modal Prerequisite)

**As a** logged-in user opening a feedback dialog,
**I want** a dropdown list of my uploaded ads to appear,
**so that** I can optionally associate my feedback with a specific ad.

**Acceptance Criteria:**

- Given the feedback dialog opens (in `support/page.tsx`, `feedback-form.tsx`, or `interact.tsx`), When the dialog becomes visible, Then `getFullAdsList(userId)` is called
- Given the user is not logged in (no userId cookie), When the dialog opens, Then no fetch is made and the ads list remains empty
- Given the service call succeeds with `result.status === true` and `result.data` as an array, When data is returned, Then the ads dropdown is populated
- Given the service call returns a non-array or `status !== true`, When data is returned, Then the ads dropdown is set to `[]`
- Given the service call fails, When an error is thrown, Then the ads dropdown is set to `[]` and the error is logged

---

### US-003 — Submit Support Request

**As a** user with a problem or question,
**I want** to submit a support ticket via the contact form,
**so that** the support team can follow up on my issue.

**Acceptance Criteria:**

- Given a user fills in name, email, category, and message and submits, When `submitSupportRequest(payload)` is called, Then a POST to `gofor=needhelp` is made with `{ gofor, user_id, description, email, category, imgname }` in the body
- Given the service call returns `response.ok`, When the response is received, Then a success toast is shown and the form is reset
- Given the service call returns a non-ok response or throws, When the response is received, Then an error toast is shown
- Given the call originates from `interact.tsx`, When the submission succeeds, Then `getUserHelpList(userId)` is called to refresh the support history table

---

### US-004 — Submit Expert Call Request

**As a** Pro-tier user,
**I want** to schedule an expert consultation call,
**so that** I can get personalised help from a specialist.

**Acceptance Criteria:**

- Given a Pro user selects a preferred date, time, and comments and submits, When `submitExpertCallRequest(payload)` is called, Then a POST to `gofor=exptalkrequest` is made with `{ gofor, user_id, prefdate, preftime, comments }` in the body
- Given the service call returns `response.ok`, When the response is received, Then a success toast is shown and the expert dialog closes
- Given the service call returns a non-ok response or throws, When the response is received, Then an error toast is shown and the error is re-thrown (so the dialog component can handle it)
- Given the call originates from `interact.tsx`, When the submission succeeds, Then `getUserExpertTalkList(userId)` is called to refresh the expert talk history table

---

### US-005 — Submit Feedback

**As a** user,
**I want** to submit a star rating and comments (optionally linked to an ad),
**so that** I can share my experience with the product team.

**Acceptance Criteria:**

- Given a user selects a rating and enters comments, When `submitFeedback(payload)` is called, Then a POST to `gofor=feedback` is made with `{ gofor, user_id, ad_upload_id, rating, comments }` in the body
- Given the service call returns `response.ok`, When the response is received, Then a success toast is shown, the form is reset, and the feedback dialog closes
- Given the service call returns a non-ok response or throws, When the response is received, Then an error toast is shown
- Given the call originates from `interact.tsx`, When the submission succeeds, Then `getUserFeedbackList(userId)` is called to refresh the feedback history table
- Given `ad_upload_id` is not selected, When the form is submitted, Then the value defaults to `"0"` (no specific ad)

---

### US-006 — Load Policy Documents

**As a** user viewing the My Account policies tab,
**I want** all three policy documents to load simultaneously,
**so that** I can read the privacy policy, return policy, or terms and conditions without waiting sequentially.

**Acceptance Criteria:**

- Given the policies component mounts, When it initialises, Then `getPrivacyPolicy()`, `getReturnPolicy()`, and `getTermsAndConditions()` are called concurrently (via `Promise.all`)
- Given all three calls succeed, When responses are received, Then each policy's raw HTML string is stored in the respective state variable and rendered
- Given any call fails, When an error is thrown, Then the error is caught, logged, and loading state is cleared (partial content is acceptable — the component currently handles this)
- The three functions return `Promise<string>` (raw HTML text, not JSON)

---

### US-007 — Load Countries List

**As a** user editing their profile or agency details,
**I want** a searchable country dropdown to populate on page load,
**so that** I can select my country without typing free text.

**Acceptance Criteria:**

- Given the MyProfile component mounts, When initialised, Then `getCountries()` is called once
- Given the call succeeds, When data is returned, Then the countries array is mapped to `[{ id: string, name: string }]` and populates the dropdown
- Given the call fails, When an error is thrown, Then the countries list remains empty and the error is logged
- `getCountries()` calls `https://techades.com/App/api.php?gofor=countrieslist` — no auth, no user_id, raw fetch only

---

### US-008 — Load States List (Country-Dependent)

**As a** user editing their profile or agency details,
**I want** a states dropdown to populate after I select a country,
**so that** I can pick my state from a contextually relevant list.

**Acceptance Criteria:**

- Given a country is selected (`selectedCountryId` is set), When the country changes, Then `getStates(countryId)` is called with the new country ID
- Given `selectedCountryId` is empty, When evaluated, Then `getStates` is not called and the states list is cleared
- Given the call succeeds, When data is returned, Then states are mapped to `[{ id, name }]` and populate the dropdown
- Given the call fails, When an error is thrown, Then the states list remains empty and the error is logged
- `getStates(countryId)` calls `https://techades.com/App/api.php?gofor=stateslist&country_id=${countryId}` — `countryId` must be URL-encoded

---

### US-009 — Load Cities List (State-Dependent)

**As a** user editing their profile or agency details,
**I want** a cities dropdown to populate after I select a state,
**so that** I can pick my city from a contextually relevant list.

**Acceptance Criteria:**

- Given a state is selected (`selectedStateId` is set), When the state changes, Then `getCities(stateId)` is called with the new state ID
- Given `selectedStateId` is empty, When evaluated, Then `getCities` is not called and the cities list is cleared
- Given the call succeeds, When data is returned, Then cities are mapped to `[{ id, name }]` and populate the dropdown
- Given the call fails, When an error is thrown, Then the cities list remains empty and the error is logged
- `getCities(stateId)` calls `https://techades.com/App/api.php?gofor=citieslist&state_id=${stateId}` — `stateId` must be URL-encoded

---

### US-010 — Load User Interaction History (Interact Page)

**As a** logged-in user on the My Account Interact page,
**I want** my support tickets, feedback history, and expert talk requests to load together on page mount,
**so that** I can review the status of all my interactions in one view.

**Acceptance Criteria:**

- Given the Interact component mounts, When `userId` is available, Then `getUserHelpList(userId)`, `getUserFeedbackList(userId)`, and `getUserExpertTalkList(userId)` are called concurrently
- Given all calls succeed, When responses are received, Then `support`, `feedbacks`, and `experts` state arrays are populated from `data.data` arrays respectively
- Given any call fails, When an error is thrown, Then all three state arrays are set to `[]`
- Each function hits `gofor=userhelplist`, `gofor=userfeedbacklist`, and `gofor=userexptalkreqlist` respectively, with `user_id` as a query param

---

## Constraints

### Pattern Assignments

| Pattern | Rule | Applies To |
|---------|------|-----------|
| B | `fetch(${NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=...)` — unauthenticated, no user_id | `faqlist` (filtered), `privacypolicy`, `returnpolicy`, `termsandconditions` |
| B POST | `fetch` POST to `/api.php` with JSON body — body may include user_id but no Authorization header | `needhelp`, `exptalkrequest`, `feedback` |
| D | `axiosInstance.get("/api.php", { params })` — carries user_id, requires auth context | `fulladsnamelist`, `userhelplist`, `userfeedbacklist`, `userexptalkreqlist` |
| External | Hardcoded `https://techades.com/App/api.php` — raw fetch only, NEVER axiosInstance | `countrieslist`, `stateslist`, `citieslist` |

### Anti-Pattern Rules

- **AP-001**: `Cookies.get` must not appear at module scope in any service file. The caller (component) passes `userId` as a function argument.
- **AP-007**: `axiosInstance` is only imported from `@/configs/axios`. No direct construction.
- `referenceDataService.ts` header comment explicitly forbids Pattern D calls in that file. The geo extensions (US-007–009) are external-domain raw fetch — this is consistent with the existing file comment.
- The policy endpoints (`privacypolicy`, `returnpolicy`, `termsandconditions`) return raw HTML text, not JSON. Service functions must use `.text()` not `.json()` and return `Promise<string>`.

### Cross-Sprint Dependencies

- `contentService.ts` `getFaqs()` (Sprint 3) must not be modified — it is used by the landing/home page and has a different call shape (no params). The new `getFaqsFiltered` is additive only.
- `referenceDataService.ts` `getLocations()` (Sprint 4) uses `LOCATION_API_BASE` already pointing at `https://techades.com/App/api.php`. The new geo functions reuse this same constant — the Architect must confirm the constant is exported or accessible within the file scope.
- `getFullAdsList` is called from three separate files (`support/page.tsx`, `feedback-form.tsx`, `interact.tsx`). All three must be migrated to import from `supportService.ts` — partial migration is not acceptable.

### Open Decision for Architect

1. **Pattern D vs B-with-user_id for authenticated GETs**: `fulladsnamelist`, `userhelplist`, `userfeedbacklist`, `userexptalkreqlist` all carry `user_id` in the query string. Sprint 4 precedent should determine whether these migrate to `axiosInstance` (Pattern D) or remain raw fetch with explicit `user_id`. The BA recommends Pattern D for consistency with the sprint series but defers to the Architect.

2. **`getFaqsFiltered` placement**: Placing the filtered FAQ function in `contentService.ts` keeps FAQ logic co-located. If the Architect prefers a clean separation, it could go in `supportService.ts` instead. Either is acceptable from a business rules standpoint.
