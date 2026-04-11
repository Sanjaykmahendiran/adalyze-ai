# Business Analysis — api-svc-004
**Sprint 4: Results, A/B, Chat, Reference Data Service Migration**
**Task ID**: api-svc-004 | **Date**: 2026-04-11 | **Agent**: nexus:level-1a:business-analyst
**Engagement type**: migration (enhancement) | **Project**: adalyze-ai

---

## 1. Sprint Scope

### Source files to modify (4 files)

| File | Raw call-sites to eliminate |
|------|----------------------------|
| `src/app/results/page.tsx` | 4 raw fetch calls (lines 554, 602, 681, 717) |
| `src/app/results/_components/AdalyzeChatBot.tsx` | 2 raw fetch calls (lines 142, 568) |
| `src/app/ab-results/page.tsx` | 4 raw fetch calls (lines 81, 82, 172, 208) |
| `src/app/ab-test/page.tsx` | 2 raw fetch calls (lines 132, 234) |

### New service files to create (4 files)

| File | Functions | gofor keys covered |
|------|-----------|-------------------|
| `src/services/resultsService.ts` | `getAdDetail`, `getHeatmap`, `deleteAd` | `addetail`, `getheatmap`, `deletead` |
| `src/services/chatService.ts` | `getChatHistory` | `getchathistory` |
| `src/services/abService.ts` | `getAbAdDetail`, `deleteAbAd` | `abaddetail`, `deleteabad` |
| `src/services/referenceDataService.ts` | `getIndustries`, `getLocations` | `industrylist`, `locationlist` |

### Import-only (no new function — reuse existing)

| Caller file | Function reused | Source service |
|-------------|-----------------|----------------|
| `src/app/results/_components/AdalyzeChatBot.tsx` | `requestExpertTalk` | `dashboardService.ts` |
| `src/app/ab-results/page.tsx` | `getAdDetail` | `resultsService.ts` |

---

## 2. User Stories and Acceptance Criteria

---

### US-001 — Results page: ad detail

**As a** logged-in user viewing my ad results page,
**I want** the page to load ad detail data through the service layer,
**so that** the authenticated fetch is consistent with Sprint 1–3 patterns and the raw gofor call is eliminated.

#### Acceptance Criteria

**Given** a logged-in user navigates to `/results` with a valid `ad_upload_id`,
**When** the page fetches ad detail,
**Then**:
- `getAdDetail(adUploadId, userId?)` is called from `resultsService.ts`
- The function uses `axiosInstance.get` with path `/api.php` and params `{ gofor: "addetail", ad_upload_id: adUploadId, user_id?: userId }` (Pattern D)
- `user_id` is included only when non-empty (matches existing conditional `userIdParam` logic)
- The return type is `AdDetail` or `Record<string, unknown>` (shape to be confirmed by Architect)
- Both call-sites on lines 681 and 717 of `results/page.tsx` are replaced by this single function

---

### US-002 — Results page: heatmap

**As a** logged-in user viewing the heatmap for an ad,
**I want** the heatmap fetch to go through the service layer,
**so that** the raw gofor call is eliminated.

#### Acceptance Criteria

**Given** a logged-in user triggers the heatmap view for an ad,
**When** the component fetches heatmap data,
**Then**:
- `getHeatmap(adUploadId)` is called from `resultsService.ts`
- The function uses `axiosInstance.get` with path `/api.php` and params `{ gofor: "getheatmap", ad_upload_id: adUploadId }` (Pattern D)
- Return type is `HeatmapData` or an appropriate typed shape (Architect to define)
- The raw fetch on line 602 of `results/page.tsx` is replaced

---

### US-003 — Results page: delete ad

**As a** logged-in user managing their ads,
**I want** the delete-ad action to go through the service layer,
**so that** the authenticated delete is consistent with other service patterns.

#### Acceptance Criteria

**Given** a logged-in user triggers ad deletion from the results page,
**When** the deletion is confirmed,
**Then**:
- `deleteAd(adId)` is called from `resultsService.ts`
- The function uses `axiosInstance.get` with path `/api.php` and params `{ gofor: "deletead", ad_upload_id: adId }` (Pattern D)
- Return type captures the backend success/failure signal (Architect to define)
- The raw fetch on line 554 of `results/page.tsx` is replaced

---

### US-004 — AdalyzeChatBot: chat history

**As a** logged-in user opening the chat panel for an ad,
**I want** the chat history to load through the service layer,
**so that** the authenticated session requirement is enforced consistently.

#### Acceptance Criteria

**Given** a logged-in user opens the AdalyzeChatBot for an ad,
**When** the component mounts and fetches prior chat history,
**Then**:
- `getChatHistory(adUploadId)` is called from `chatService.ts`
- The function uses `axiosInstance.get` with path `/api.php` and params `{ gofor: "getchathistory", ad_upload_id: adUploadId }` (Pattern D)
- Return type is `ChatMessage[]` or an appropriate typed shape (Architect to define)
- The raw fetch on line 142 of `AdalyzeChatBot.tsx` is replaced

---

### US-005 — AdalyzeChatBot: expert talk request (reuse, no new function)

**As a** logged-in user requesting an expert consultation from the chat panel,
**I want** the expert talk request to use the same service function as the dashboard,
**so that** there is a single implementation of this POST and no duplicated logic.

#### Acceptance Criteria

**Given** a logged-in user submits an expert talk request from inside AdalyzeChatBot,
**When** the form is submitted,
**Then**:
- `requestExpertTalk(payload)` is imported from `dashboardService.ts` (not re-implemented)
- No new `exptalkrequest` function exists in `chatService.ts` or any other new Sprint 4 file
- The raw fetch POST on line 568 of `AdalyzeChatBot.tsx` is replaced by the imported function
- The `ExpertTalkPayload` type is imported from `@/types/api` (unchanged from Sprint 3)

---

### US-006 — A/B results page: A/B detail

**As a** logged-in user viewing an A/B comparison,
**I want** the A/B combined detail fetch to go through the service layer,
**so that** the raw gofor call is eliminated.

#### Acceptance Criteria

**Given** a logged-in user loads the A/B results page with two ad IDs,
**When** the combined A/B detail is fetched,
**Then**:
- `getAbAdDetail(adIdA, adIdB)` is called from `abService.ts`
- The function uses `axiosInstance.get` with path `/api.php` and params `{ gofor: "abaddetail", ad_upload_id1: adIdA, ad_upload_id2: adIdB }` (Pattern D)
- Return type is `AbAdDetailResponse` or an appropriate typed shape (Architect to define)
- The raw fetch on line 172 of `ab-results/page.tsx` is replaced

---

### US-007 — A/B results page: individual ad detail (reuse, no new function)

**As a** logged-in user loading the A/B results page,
**I want** each individual ad in the pair to load via the same `getAdDetail` function as the results page,
**so that** there is no duplicate implementation of the `addetail` gofor call.

#### Acceptance Criteria

**Given** the A/B results page loads ad IDs A and B,
**When** individual ad details are fetched (lines 81 and 82),
**Then**:
- `getAdDetail` is imported from `resultsService.ts` (not re-implemented in `abService.ts`)
- Both calls on lines 81 and 82 are replaced with calls to the imported function
- No duplicate `addetail` function exists in `abService.ts`

---

### US-008 — A/B results page: delete A/B ad pair

**As a** logged-in user managing their A/B ads,
**I want** the A/B pair deletion to go through the service layer,
**so that** the authenticated delete is consistent.

#### Acceptance Criteria

**Given** a logged-in user triggers deletion of an A/B pair,
**When** the deletion is confirmed,
**Then**:
- `deleteAbAd(adIdA, adIdB)` is called from `abService.ts`
- The function uses `axiosInstance.get` with path `/api.php` and params `{ gofor: "deleteabad", ad_upload_id_a: adIdA, ad_upload_id_b: adIdB }` (Pattern D)
- Return type captures the backend success/failure signal (Architect to define)
- The raw fetch on line 208 of `ab-results/page.tsx` is replaced

---

### US-009 — A/B test page: industry list

**As a** user creating an A/B test,
**I want** the industry list dropdown to load through the service layer,
**so that** the public lookup call is consistently managed.

#### Acceptance Criteria

**Given** a user loads the A/B test creation page,
**When** the industry list is fetched,
**Then**:
- `getIndustries()` is called from `referenceDataService.ts`
- The function uses raw `fetch` (Pattern B) — NOT `axiosInstance` — against `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=industrylist`
- No `user_id` is included (public, unauthenticated lookup)
- Return type is `Industry[]` or an appropriate typed shape (Architect to define)
- The raw fetch on line 132 of `ab-test/page.tsx` is replaced

---

### US-010 — A/B test page: location list

**As a** user typing a location search on the A/B test page,
**I want** location suggestions to load through the service layer,
**so that** the external domain fetch is consistently managed.

#### Acceptance Criteria

**Given** a user types a search term in the location input,
**When** the location lookup fires,
**Then**:
- `getLocations(searchTerm)` is called from `referenceDataService.ts`
- The function uses raw `fetch` with the hardcoded base URL `https://techades.com/App/api.php?gofor=locationlist&search=${searchTerm}`
- `axiosInstance` is NEVER used for this call (external domain, not proxied through the app's API)
- The hardcoded URL is a constant inside `referenceDataService.ts` — not exposed as a param
- Return type is `Location[]` or an appropriate typed shape (Architect to define)
- The raw fetch on line 234 of `ab-test/page.tsx` is replaced

---

## 3. Business Rules

| ID | Rule |
|----|------|
| BR-001 | All authenticated gofor calls (`addetail`, `getheatmap`, `deletead`, `getchathistory`, `abaddetail`, `deleteabad`) MUST use `axiosInstance` from `@/configs/axios` — never raw `fetch`. This ensures the Sprint 1 401 interceptor fires on session expiry. |
| BR-002 | The `industrylist` gofor call is unauthenticated. It MUST use raw `fetch` with `process.env.NEXT_PUBLIC_API_BASE_URL`. It MUST NOT pass a `user_id` or auth header. |
| BR-003 | The `locationlist` call targets an external server (`techades.com`). It MUST use raw `fetch` with the hardcoded full URL. It MUST NOT be routed through `axiosInstance` regardless of any future refactor. This constraint is permanent — the domain is not owned by this application. |
| BR-004 | `requestExpertTalk` MUST NOT be re-implemented in `chatService.ts` or anywhere else. `AdalyzeChatBot.tsx` MUST import it from `dashboardService.ts`. Duplicate implementations of the same backend endpoint are forbidden across the service layer. |
| BR-005 | `getAdDetail` MUST NOT be re-implemented in `abService.ts`. `ab-results/page.tsx` MUST import it from `resultsService.ts`. |
| BR-006 | Service functions MUST NOT read cookies or auth tokens directly. `user_id` and any other user-scoped identifiers must be passed as parameters by the calling component. |
| BR-007 | `axiosInstance` import path is `@/configs/axios` (alias). Relative imports to `../../configs/axios/index.js` are forbidden (AP-007, established Sprint 1). |
| BR-008 | The `addetail` gofor call accepts an optional `user_id`. `getAdDetail` must accept `userId` as an optional second parameter. When absent or empty, `user_id` must be omitted from the request params — not sent as an empty string or zero. |
| BR-009 | No Sprint 4 service file may modify the frozen files: `src/configs/axios/index.js`, `src/lib/eventTracker.ts`, `src/services/cookieConsentService.ts`. |
| BR-010 | `src/types/api.ts` Sprint 4 additions must append after the last Sprint 3 line. Lines 1 through the current Sprint 3 boundary are frozen (append-only, no edits to existing interfaces). |

---

## 4. Out-of-Scope Items (Sprint 4)

The following are explicitly deferred and MUST NOT be touched in Sprint 4.

### Deferred to Sprint 5

| File | Calls |
|------|-------|
| `src/app/support/page.tsx` | `faqlist`, `fulladsnamelist` |
| `src/app/myaccount/_components/interact.tsx` | `userhelplist` and related |
| `src/app/myprofile/page.tsx` (if applicable) | Any gofor calls present |

### Deferred to Sprint 6

| Scope | Notes |
|-------|-------|
| All landing pages | `/src/app/(landing)/` or equivalent public routes |
| Blog and CMS pages | Any `blog`, `cms`, `policy`, `privacy` routes |
| Full content service consolidation | `contentService.ts` was created as a holding file in Sprint 3; Sprint 6 will consolidate all public content endpoints |

### Frozen (never migrate)

| File | Reason |
|------|--------|
| `src/lib/eventTracker.ts` | Bare fetch with offline queue — intentional, permanent freeze |
| `src/services/cookieConsentService.ts` | Frozen Sprint 1 — consent POST/GET pattern is stable and must not change |
| `src/app/results/_components/FixThisAdDrawer.tsx` | Frozen — Sprint 3 carried this forward; Sprint 4 does not touch it |
| All `techades.com` external API calls (other than `locationlist` via `referenceDataService.ts`) | External domain — cannot be proxied via `axiosInstance`. `locationlist` is the only `techades.com` call in Sprint 4 scope, and it is handled via raw fetch in `referenceDataService.ts` |

### Not in Sprint 4 scope

- No new UI components, no layout changes, no routing changes
- No changes to `src/configs/axios/index.js` (axiosInstance config is locked)
- No changes to existing Sprint 1–3 service files except where a Sprint 4 caller imports from them
- No changes to `src/app/dashboard/page.tsx` (Sprint 3 complete, verified)
- No TypeScript interface changes to Sprint 1–3 sections of `src/types/api.ts`

---

## 5. Dependencies

### Existing code dependencies (must not break)

| Dependency | Used by Sprint 4 | Nature |
|-----------|-----------------|--------|
| `axiosInstance` from `@/configs/axios` | `resultsService.ts`, `chatService.ts`, `abService.ts` | Import — locked, no change |
| `requestExpertTalk` from `dashboardService.ts` | `AdalyzeChatBot.tsx` | Import — existing function, no change to its signature |
| `getAdDetail` from `resultsService.ts` (new) | `ab-results/page.tsx` | Cross-file import — `resultsService.ts` must be created before `ab-results` is migrated |
| `ExpertTalkPayload` from `@/types/api` | `AdalyzeChatBot.tsx` (via `dashboardService.ts`) | Existing type — no change |
| `src/types/api.ts` | All 4 new service files | Append Sprint 4 interfaces to the existing file |
| `process.env.NEXT_PUBLIC_API_BASE_URL` | `resultsService.ts`, `chatService.ts`, `abService.ts`, `referenceDataService.ts` | Environment variable — used in all services; must be available in the Next.js 14 env config |

### Intra-Sprint 4 dependency (sequencing constraint)

`resultsService.ts` must be fully defined before `ab-results/page.tsx` migration begins, because `ab-results/page.tsx` imports `getAdDetail` from `resultsService.ts`. The Lead and Dev agents must sequence implementation in this order:

1. `resultsService.ts` (creates `getAdDetail`, `getHeatmap`, `deleteAd`)
2. `chatService.ts` (creates `getChatHistory`)
3. `abService.ts` (creates `getAbAdDetail`, `deleteAbAd`)
4. `referenceDataService.ts` (creates `getIndustries`, `getLocations`)
5. Migrate `results/page.tsx`
6. Migrate `AdalyzeChatBot.tsx`
7. Migrate `ab-results/page.tsx`
8. Migrate `ab-test/page.tsx`

---

## 6. HTTP Pattern Assignment (confirmed)

| gofor / endpoint | Service | Pattern | Client |
|-----------------|---------|---------|--------|
| `addetail` | `resultsService.ts` | D | `axiosInstance.get("/api.php", { params: { gofor, ad_upload_id, user_id? } })` |
| `getheatmap` | `resultsService.ts` | D | `axiosInstance.get("/api.php", { params: { gofor, ad_upload_id } })` |
| `deletead` | `resultsService.ts` | D | `axiosInstance.get("/api.php", { params: { gofor, ad_upload_id } })` |
| `getchathistory` | `chatService.ts` | D | `axiosInstance.get("/api.php", { params: { gofor, ad_upload_id } })` |
| `abaddetail` | `abService.ts` | D | `axiosInstance.get("/api.php", { params: { gofor, ad_upload_id1, ad_upload_id2 } })` |
| `deleteabad` | `abService.ts` | D | `axiosInstance.get("/api.php", { params: { gofor, ad_upload_id_a, ad_upload_id_b } })` |
| `industrylist` | `referenceDataService.ts` | B | `fetch("${env}/api.php?gofor=industrylist")` — raw, no auth |
| `locationlist` | `referenceDataService.ts` | external | `fetch("https://techades.com/App/api.php?gofor=locationlist&search=${term}")` — raw, hardcoded URL |
| `exptalkrequest` | **dashboardService.ts (existing)** | — | Import only, no new function |

Pattern D definition (from Sprint 3 Architect — immutable): `axiosInstance.get("/api.php", { params: { gofor: "...", user_id, ...otherParams } })` — authenticated user-scoped gofor calls.

---

## 7. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NF-001 | Zero new TypeScript compiler errors in the 4 modified source files and 4 new service files after Sprint 4 implementation. The project must pass `tsc --noEmit` for Sprint 4 files. |
| NF-002 | Zero new lint errors introduced in Sprint 4 files. |
| NF-003 | The Next.js 14 frontend build (`cd frontend && npm run build` or equivalent) must succeed after Sprint 4 is complete. |
| NF-004 | Existing Sprint 1–3 service tests must continue to pass. Sprint 4 must not break `src/services/__tests__/` test suite. |
| NF-005 | No regression in the behaviour of `results/page.tsx`, `AdalyzeChatBot.tsx`, `ab-results/page.tsx`, or `ab-test/page.tsx` as observable by a manual smoke test (call fires, response handled, UI updates as before). |
| NF-006 | Each new service file must have a corresponding test file under `src/services/__tests__/` (e.g., `resultsService.test.ts`). Minimum coverage: one test per exported function, covering the happy path. |

---

## 8. Risk Flags for Architect

| # | Risk | Severity | Notes for Architect |
|---|------|----------|---------------------|
| R1 | `addetail` is called with and without `user_id` across two pages — `getAdDetail` signature must handle the optional param cleanly without sending `user_id=undefined` in the query string | HIGH | Architect must define the optional param handling explicitly (strip undefined from params object before passing) |
| R2 | `locationlist` uses `techades.com` — this is a CORS-sensitive external call. Confirm that the current raw fetch from the browser already works (Sprint 4 does not change the transport, only wraps it) | MEDIUM | Architect: no transport change, just encapsulation. If CORS is already broken in the raw call, that is pre-existing and out of Sprint 4 scope |
| R3 | `AdalyzeChatBot.tsx` currently performs the `exptalkrequest` POST inline. After migration it imports from `dashboardService.ts` — confirm the `ExpertTalkPayload` shape in `api.ts` matches what `AdalyzeChatBot.tsx` currently constructs (line 568 body: `{ gofor, user_id, prefdate, preftime, comments }`) | MEDIUM | Architect: verify the `gofor` field in the inline POST — `requestExpertTalk` in `dashboardService.ts` already abstracts the `gofor` key inside the function; the payload passed by the caller must NOT include `gofor` |
| R4 | `results/page.tsx` has two separate `addetail` call-sites (lines 681, 717) — likely called in different component lifecycle events or conditions. Both must be replaced by the same `getAdDetail` function. Architect must confirm whether the two calls are structurally identical or differ in param composition | LOW | Codebase Analyst to verify during analyze stage |
| R5 | `referenceDataService.ts` mixes two fundamentally different HTTP patterns (Pattern B for `industrylist`, external raw fetch for `locationlist`). This is the only service file in Sprints 1–4 that mixes patterns. Architect must comment this explicitly in the service file to prevent future contributors from incorrectly adding authenticated calls to it | LOW | Document in service file header |

---

## 9. SME Consultation Notes

No external SME consultation is required for Sprint 4. All domain knowledge is derivable from:
- Sprint 1–3 architecture decisions (immutable HTTP patterns, AP-007 import rule)
- The Sprint 3 Architect document (`api-svc-003-architect.md`) which established Patterns A–D
- The existing `dashboardService.ts` implementation (canonical Pattern D example)

The Architect stage should confirm the TypeScript interface shapes for `AdDetail`, `HeatmapData`, `ChatMessage`, `AbAdDetailResponse`, `Industry`, and `Location` by reading the raw call-site response handling in the four target files before proposing types.

---

## 10. Priority and Impact Assessment

**Priority**: High — Sprint 4 is the last authenticated-page migration sprint. Completing it eliminates all raw gofor calls from the results and A/B analysis flows, which are the highest-traffic authenticated pages in the application.

**Impact**: Medium-scope. 4 new service files, 4 modified pages, ~10 raw fetch call-sites replaced. No new backend work. No database changes. No routing changes. Risk is contained to TypeScript type accuracy and the one cross-service import dependency (`getAdDetail` shared across `results` and `ab-results`).

**Sprint boundary**: Sprint 4 ends when all 10 raw fetch call-sites listed above are eliminated from the 4 target files. Sprint 5 (support, interact, myprofile) does not begin until Sprint 4 QA passes.
