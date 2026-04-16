# Architecture Spec -- api-svc-005

**Date**: 2026-04-11
**Architect**: solution-architect (Level 1C)
**Scope**: Sprint 5 service layer -- support, policies, profile geo, FAQ filters
**Depends on**: api-svc-004-architect.md (immutable HTTP patterns, AP-001 through AP-008)

---

## Service File Plan

| File | Action | Reason |
|------|--------|--------|
| `src/services/supportService.ts` | CREATE | New service. Houses all support/interact/feedback/policy functions. 10 functions total covering 17 of the 20 call sites. This is a write-heavy service (3 POST mutations) mixed with authenticated reads (4 GETs) and unauthenticated reads (3 policy GETs). The mixed pattern is acceptable because all functions serve the same user-facing domain (support center + my-account interact). The service file will NOT import axiosInstance -- see ADR-3 below. |
| `src/services/contentService.ts` | EXTEND | Add `getFaqsFiltered(category: string, search: string)`. Existing `getFaqs()` remains untouched. +1 function, append-only. |
| `src/services/referenceDataService.ts` | EXTEND | Add `getCountries()`, `getStates(countryId: string)`, `getCities(stateId: string)`. All three use `LOCATION_API_BASE` constant already declared in the file. +3 functions, append-only. The file's header comment explicitly forbids Pattern D calls; these three are all External pattern (raw fetch to techades.com), which is consistent. |
| `src/types/api.ts` | EXTEND | Append Sprint 5 interfaces after the Sprint 4 block (after line 656). Append-only freeze on lines 1-656. |

---

## TypeScript Interfaces

All new interfaces append to `src/types/api.ts` after the existing Sprint 4 block.

```typescript
// -- Sprint 5 additions ---------------------------------------------------

// -- Support service ------------------------------------------------------

/**
 * SupportAd -- item from fulladsnamelist response.data.
 * Minimal shape: only ad_id and ads_name are consumed by the
 * feedback dropdown in support/page.tsx, feedback-form.tsx, interact.tsx.
 */
export interface SupportAd {
  ad_id: number;
  ads_name: string;
}

/**
 * SupportAdListResponse -- envelope from GET fulladsnamelist.
 * status: boolean (true = has data). data: SupportAd[] | undefined.
 */
export interface SupportAdListResponse {
  status: boolean;
  data?: SupportAd[];
}

/**
 * SupportItem -- item from userhelplist response.data.
 * Fields match the interact.tsx local SupportItem type.
 */
export interface SupportItem {
  help_id: number;
  email: string | null;
  user_id: number;
  category: string | null;
  description: string | null;
  comments?: string | null;
  estatus?: string | null;
  status?: number | string | null;
  created_date?: string | null;
  user_name?: string | null;
}

/**
 * FeedbackItem -- item from userfeedbacklist response.data.
 */
export interface FeedbackItem {
  fbid: number;
  user_id: number;
  ad_upload_id?: number;
  rating?: number;
  comments?: string | null;
  status?: number | string | null;
  created_date?: string | null;
  user_name?: string | null;
  ads_name?: string | null;
}

/**
 * ExpertTalkItem -- item from userexptalkreqlist response.data.
 */
export interface ExpertTalkItem {
  exptalk_id: number;
  user_id: number;
  prefdate?: string | null;
  preftime?: string | null;
  comments?: string | null;
  estatus?: string | null;
  status?: number | string | null;
  created_date?: string | null;
  modified_date?: string | null;
  user_name?: string | null;
}

/**
 * UserListResponse -- generic envelope for userhelplist, userfeedbacklist,
 * userexptalkreqlist. All three return { data: T[] }.
 */
export interface UserListResponse<T> {
  data?: T[];
}

/**
 * SupportRequestPayload -- body for POST needhelp.
 * gofor is set by the service, not the caller.
 */
export interface SupportRequestPayload {
  user_id: string;
  description: string;
  email: string;
  category: string;
  imgname?: string;
}

/**
 * FeedbackPayload -- body for POST feedback.
 * gofor is set by the service, not the caller.
 */
export interface FeedbackPayload {
  user_id: string;
  ad_upload_id: string;
  rating: string;
  comments: string;
}

/**
 * ExpertCallPayload -- body for POST exptalkrequest (support context).
 * NOTE: This is distinct from the ExpertTalkPayload in Sprint 3
 * (dashboardService) which uses user_id: number and posts to
 * /api/dashboard/expert-talk. This payload posts to /api.php with
 * gofor in the body and user_id as string.
 */
export interface ExpertCallPayload {
  user_id: string;
  prefdate: string;
  preftime: string;
  comments: string;
}

// -- Reference data service (Sprint 5 geo) --------------------------------

/**
 * GeoItem -- item from countrieslist, stateslist, citieslist.
 * External API returns { id: number|string, name: string }.
 * Service normalises id to string for consistency with LocationResult.
 */
export interface GeoItem {
  id: string;
  name: string;
}
```

---

## Function Signatures

### `src/services/supportService.ts` (CREATE)

```typescript
// --------------------------------------------------------------------------
// IMPORTANT: This service uses raw fetch for ALL functions.
// Pattern B (unauthenticated GET), Pattern B-GET-Auth (authenticated GET
// with user_id in query string), and Pattern B-POST (POST with gofor in
// JSON body). axiosInstance is NOT used here. See ADR-3 for rationale.
// --------------------------------------------------------------------------

import type {
  SupportAd,
  SupportAdListResponse,
  SupportItem,
  FeedbackItem,
  ExpertTalkItem,
  UserListResponse,
  SupportRequestPayload,
  FeedbackPayload,
  ExpertCallPayload,
} from "@/types/api";

// ── Authenticated GETs (user_id in query string, no auth header) ─────────

/**
 * getFullAdsList -- fetch user's ad names for feedback dropdown.
 *
 * Pattern B-GET-Auth: raw fetch to api.php with user_id in query string.
 * No Authorization header. Returns SupportAd[] extracted from envelope.
 *
 * NORMALISATION: Backend returns { status: boolean, data?: SupportAd[] }.
 * Service checks status === true and Array.isArray(data) before returning.
 * Returns [] on any failure shape.
 *
 * Shared by: support/page.tsx, feedback-form.tsx, interact.tsx (3 callers).
 */
export const getFullAdsList = async (
  userId: string
): Promise<SupportAd[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=fulladsnamelist&user_id=${encodeURIComponent(userId)}`
  );
  if (!res.ok) throw new Error(`fulladsnamelist failed: ${res.status}`);
  const result: SupportAdListResponse = await res.json();
  if (result.status && Array.isArray(result.data)) {
    return result.data;
  }
  return [];
};

/**
 * getUserHelpList -- fetch user's support tickets.
 *
 * Pattern B-GET-Auth: raw fetch, user_id in query string.
 * Returns SupportItem[] extracted from envelope.
 */
export const getUserHelpList = async (
  userId: string
): Promise<SupportItem[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=userhelplist&user_id=${encodeURIComponent(userId)}`
  );
  if (!res.ok) throw new Error(`userhelplist failed: ${res.status}`);
  const result: UserListResponse<SupportItem> = await res.json();
  return Array.isArray(result.data) ? result.data : [];
};

/**
 * getUserFeedbackList -- fetch user's feedback history.
 *
 * Pattern B-GET-Auth: raw fetch, user_id in query string.
 * Returns FeedbackItem[] extracted from envelope.
 */
export const getUserFeedbackList = async (
  userId: string
): Promise<FeedbackItem[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=userfeedbacklist&user_id=${encodeURIComponent(userId)}`
  );
  if (!res.ok) throw new Error(`userfeedbacklist failed: ${res.status}`);
  const result: UserListResponse<FeedbackItem> = await res.json();
  return Array.isArray(result.data) ? result.data : [];
};

/**
 * getUserExpertTalkList -- fetch user's expert talk requests.
 *
 * Pattern B-GET-Auth: raw fetch, user_id in query string.
 * Returns ExpertTalkItem[] extracted from envelope.
 */
export const getUserExpertTalkList = async (
  userId: string
): Promise<ExpertTalkItem[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=userexptalkreqlist&user_id=${encodeURIComponent(userId)}`
  );
  if (!res.ok) throw new Error(`userexptalkreqlist failed: ${res.status}`);
  const result: UserListResponse<ExpertTalkItem> = await res.json();
  return Array.isArray(result.data) ? result.data : [];
};

// ── Unauthenticated GETs (policy documents) ─────────────────────────────

/**
 * getPrivacyPolicy -- fetch privacy policy HTML.
 *
 * Pattern B: raw fetch, unauthenticated. Returns raw HTML text (not JSON).
 * Callers render via HtmlRenderer component.
 */
export const getPrivacyPolicy = async (): Promise<string> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=privacypolicy`
  );
  if (!res.ok) throw new Error(`privacypolicy failed: ${res.status}`);
  return res.text();
};

/**
 * getReturnPolicy -- fetch return policy HTML.
 *
 * Pattern B: raw fetch, unauthenticated. Returns raw HTML text.
 */
export const getReturnPolicy = async (): Promise<string> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=returnpolicy`
  );
  if (!res.ok) throw new Error(`returnpolicy failed: ${res.status}`);
  return res.text();
};

/**
 * getTermsAndConditions -- fetch terms and conditions HTML.
 *
 * Pattern B: raw fetch, unauthenticated. Returns raw HTML text.
 */
export const getTermsAndConditions = async (): Promise<string> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=termsandconditions`
  );
  if (!res.ok) throw new Error(`termsandconditions failed: ${res.status}`);
  return res.text();
};

// ── POST mutations ──────────────────────────────────────────────────────

/**
 * submitSupportRequest -- POST a new support ticket.
 *
 * Pattern B-POST: raw fetch POST to api.php with JSON body.
 * gofor is injected by the service. Caller provides SupportRequestPayload.
 * Returns the raw Response object (caller checks response.ok for toast).
 */
export const submitSupportRequest = async (
  payload: SupportRequestPayload
): Promise<Response> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gofor: "needhelp",
        ...payload,
        imgname: payload.imgname || "",
      }),
    }
  );
  if (!res.ok) throw new Error(`needhelp failed: ${res.status}`);
  return res;
};

/**
 * submitFeedback -- POST user feedback.
 *
 * Pattern B-POST: raw fetch POST to api.php with JSON body.
 * gofor is injected by the service.
 * Returns the raw Response object.
 */
export const submitFeedback = async (
  payload: FeedbackPayload
): Promise<Response> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gofor: "feedback",
        ...payload,
      }),
    }
  );
  if (!res.ok) throw new Error(`feedback failed: ${res.status}`);
  return res;
};

/**
 * submitExpertCallRequest -- POST an expert call request.
 *
 * Pattern B-POST: raw fetch POST to api.php with JSON body.
 * gofor is injected by the service.
 * Returns the raw Response object.
 *
 * NOTE: This is intentionally separate from dashboardService.requestExpertTalk.
 * That function posts to /api/dashboard/expert-talk via axiosInstance
 * (Pattern A, REST route). This function posts to /api.php with gofor
 * in the body (Pattern B-POST). They are different backend routes despite
 * serving the same domain concept. See ADR-5.
 */
export const submitExpertCallRequest = async (
  payload: ExpertCallPayload
): Promise<Response> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gofor: "exptalkrequest",
        ...payload,
      }),
    }
  );
  if (!res.ok) throw new Error(`exptalkrequest failed: ${res.status}`);
  return res;
};
```

### `src/services/contentService.ts` (EXTEND -- append only)

```typescript
// Append after existing getTestimonials function (line 47):

/**
 * getFaqsFiltered -- fetch FAQs with category and search filters.
 *
 * Pattern B: raw fetch, unauthenticated, same origin.
 *
 * This is intentionally separate from getFaqs() (which takes no params
 * and is used by the landing/home page). The support page always passes
 * category and conditionally passes search. These are different UX
 * contracts -- merging them would couple the landing page to filter logic.
 *
 * Returns FAQ[] (same type as getFaqs). Empty array on empty response.
 */
export const getFaqsFiltered = async (
  category: string,
  search: string
): Promise<FAQ[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=faqlist&category=${encodeURIComponent(category)}&search=${encodeURIComponent(search)}`
  );
  if (!res.ok) throw new Error(`faqlist (filtered) failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};
```

### `src/services/referenceDataService.ts` (EXTEND -- append only)

```typescript
// Append after existing getLocations function (line 29):

import type { GeoItem } from "@/types/api";
// NOTE: The GeoItem import must be added to the existing import block at the
// top of the file. The LocationResult import already exists on line 9.

/**
 * getCountries -- fetch full country list.
 *
 * External raw fetch: hardcoded techades.com URL via LOCATION_API_BASE.
 * axiosInstance MUST NOT be used (external domain, not proxied).
 *
 * NORMALISATION: External API returns [{ id: number|string, name: string }].
 * Service maps id to string for consistency with GeoItem type.
 */
export const getCountries = async (): Promise<GeoItem[]> => {
  const res = await fetch(
    `${LOCATION_API_BASE}?gofor=countrieslist`
  );
  if (!res.ok) throw new Error(`getCountries failed: ${res.status}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map(
    (c: { id: string | number; name: string }) => ({
      id: String(c.id),
      name: String(c.name),
    })
  );
};

/**
 * getStates -- fetch states for a given country.
 *
 * External raw fetch. countryId is URL-encoded for safety.
 * Same normalisation as getCountries.
 */
export const getStates = async (
  countryId: string
): Promise<GeoItem[]> => {
  const res = await fetch(
    `${LOCATION_API_BASE}?gofor=stateslist&country_id=${encodeURIComponent(countryId)}`
  );
  if (!res.ok) throw new Error(`getStates failed: ${res.status}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map(
    (s: { id: string | number; name: string }) => ({
      id: String(s.id),
      name: String(s.name),
    })
  );
};

/**
 * getCities -- fetch cities for a given state.
 *
 * External raw fetch. stateId is URL-encoded for safety.
 * Same normalisation as getCountries.
 */
export const getCities = async (
  stateId: string
): Promise<GeoItem[]> => {
  const res = await fetch(
    `${LOCATION_API_BASE}?gofor=citieslist&state_id=${encodeURIComponent(stateId)}`
  );
  if (!res.ok) throw new Error(`getCities failed: ${res.status}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map(
    (c: { id: string | number; name: string }) => ({
      id: String(c.id),
      name: String(c.name),
    })
  );
};
```

---

## Pattern Assignments

| Function | Pattern | HTTP Method | Endpoint | Auth | Service File |
|----------|---------|-------------|----------|------|--------------|
| `getFaqsFiltered` | B | GET | `api.php?gofor=faqlist&category=...&search=...` | No | `contentService.ts` |
| `getFullAdsList` | B-GET-Auth | GET | `api.php?gofor=fulladsnamelist&user_id=...` | Soft (user_id in URL, no header) | `supportService.ts` |
| `getUserHelpList` | B-GET-Auth | GET | `api.php?gofor=userhelplist&user_id=...` | Soft (user_id in URL, no header) | `supportService.ts` |
| `getUserFeedbackList` | B-GET-Auth | GET | `api.php?gofor=userfeedbacklist&user_id=...` | Soft (user_id in URL, no header) | `supportService.ts` |
| `getUserExpertTalkList` | B-GET-Auth | GET | `api.php?gofor=userexptalkreqlist&user_id=...` | Soft (user_id in URL, no header) | `supportService.ts` |
| `getPrivacyPolicy` | B | GET | `api.php?gofor=privacypolicy` | No | `supportService.ts` |
| `getReturnPolicy` | B | GET | `api.php?gofor=returnpolicy` | No | `supportService.ts` |
| `getTermsAndConditions` | B | GET | `api.php?gofor=termsandconditions` | No | `supportService.ts` |
| `submitSupportRequest` | B-POST | POST | `api.php` (gofor=needhelp in body) | Soft (user_id in body, no header) | `supportService.ts` |
| `submitFeedback` | B-POST | POST | `api.php` (gofor=feedback in body) | Soft (user_id in body, no header) | `supportService.ts` |
| `submitExpertCallRequest` | B-POST | POST | `api.php` (gofor=exptalkrequest in body) | Soft (user_id in body, no header) | `supportService.ts` |
| `getCountries` | External | GET | `techades.com/App/api.php?gofor=countrieslist` | No | `referenceDataService.ts` |
| `getStates` | External | GET | `techades.com/App/api.php?gofor=stateslist&country_id=...` | No | `referenceDataService.ts` |
| `getCities` | External | GET | `techades.com/App/api.php?gofor=citieslist&state_id=...` | No | `referenceDataService.ts` |

---

## Architecture Decisions

### ADR-1: `getFaqsFiltered` placement -- contentService.ts (not supportService.ts)

**Chosen**: Add `getFaqsFiltered` to `contentService.ts`.
**Rejected**: Create it in `supportService.ts`.

**Rationale**: FAQs are content, not support infrastructure. `contentService.ts` already owns `getFaqs()` (bare faqlist for the landing page). Co-locating the filtered variant keeps FAQ logic in one place. If a future sprint needs FAQ filtering on a non-support page, the function is already in the content service without cross-domain coupling. The existing `getFaqs()` in contentService uses Pattern B; `getFaqsFiltered` also uses Pattern B. No pattern mixing.

**Risk assessment**: None. The existing `getFaqs()` function is untouched. The new function is additive. Both return `FAQ[]` from the same `@/types/api` interface (Sprint 3).

### ADR-2: Geo functions placement -- extend referenceDataService.ts

**Chosen**: Add `getCountries`, `getStates`, `getCities` to `referenceDataService.ts`.
**Rejected**: Create a separate `geoService.ts`.

**Rationale**: The file's own header comment says "This service mixes two raw-fetch patterns (Pattern B + external). Neither function uses axiosInstance." The three geo functions are ALL external-domain raw fetch calls to `techades.com` -- the exact same pattern as the existing `getLocations`. They reuse the `LOCATION_API_BASE` constant already declared in the file (line 11). Creating `geoService.ts` would duplicate the constant, the import pattern, and the external fetch boilerplate for no architectural benefit. The file comment's "Do NOT add authenticated (Pattern D) functions" restriction is not violated -- these are unauthenticated external calls.

**Confirmed**: `LOCATION_API_BASE` is a file-scoped `const` (not exported). The three new functions are in the same file and can access it directly. No export needed.

### ADR-3: Authenticated support/interact GETs -- raw fetch (B-GET-Auth), NOT axiosInstance (Pattern D)

**Chosen**: Raw `fetch` with `user_id` in the query string (Pattern B-GET-Auth).
**Rejected**: `axiosInstance.get("/api.php", { params })` (Pattern D).

**Rationale -- the critical decision of this sprint**: This requires careful analysis of precedent and the actual behavior of these endpoints.

**Evidence from the codebase**:
1. The existing calls in `support/page.tsx` (line 120), `feedback-form.tsx` (line 55), and `interact.tsx` (lines 247-249, 274) ALL use raw `fetch` with `user_id` in the URL. None set an Authorization header.
2. Sprint 3/4 Pattern D endpoints (`activateFreeTrial`, `getPaymentHistory`, `getAdDetail`, `getChatHistory`, etc.) use `axiosInstance` because they benefit from the 401 interceptor -- if a user's session expires mid-page, the interceptor redirects to login.
3. However, the support/interact endpoints behave differently: `interact.tsx` line 211 reads `userId` as `Cookies.get("userId") || "5"` -- it defaults to a hardcoded "5" if no cookie is found, meaning the page renders even without authentication. These endpoints do not return 401 errors; they return data scoped to whatever user_id is passed. The backend does not validate an Authorization header for these gofor calls.

**The decision rule**: Pattern D (axiosInstance) is correct when the backend endpoint validates authentication and may return 401. These five `api.php?gofor=` endpoints accept `user_id` as a query parameter with no authentication header validation. They are "soft auth" -- the user_id is an identity parameter, not a security boundary. Using axiosInstance would inject an Authorization header that the backend ignores, and the 401 interceptor would never fire because the backend never returns 401 for these endpoints.

**Precedent consistency**: Sprint 3's `pricingService.activateFreeTrial` was migrated to axiosInstance specifically because the comment says "user-scoped; uses axiosInstance for 401 redirect." Sprint 3's `paymentService.getPaymentHistory` was also migrated to axiosInstance. Both of those endpoints go through the backend's auth middleware. The support gofor endpoints do not -- they are PHP api.php handlers that take user_id as a plain parameter.

**Risk**: If the backend adds auth middleware to these endpoints in the future, they would need to be migrated to Pattern D. This is a one-function-at-a-time migration (change `fetch` to `axiosInstance.get` and restructure params). The risk is low and the migration path is clear.

### ADR-4: POST endpoints -- raw fetch (B-POST), NOT axiosInstance.post

**Chosen**: Raw `fetch` POST to `api.php` with `gofor` in the JSON body (Pattern B-POST).
**Rejected**: `axiosInstance.post("/api.php", body)` (Pattern D-POST).

**Rationale**: Same reasoning as ADR-3 applies to the POST side. The evidence is unambiguous:

1. All three POST calls (`needhelp`, `exptalkrequest`, `feedback`) in both `support/page.tsx` and `interact.tsx` use raw `fetch` with `{ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({...}) }`. No Authorization header is set.
2. The existing `cookieConsentService.ts` (Sprint 1, frozen) uses `axiosInstance.post("/api.php", payload)` for its POST -- but that is a special case where cookie consent tracking benefits from the auth interceptor (it conditionally attaches user_id). The support POST endpoints do not have this requirement.
3. The `dashboardService.requestExpertTalk` uses `axiosInstance.post("/api/dashboard/expert-talk", payload)` -- but that hits a REST route (`/api/dashboard/expert-talk`), not `api.php?gofor=`. The REST routes go through auth middleware. The `api.php` gofor=exptalkrequest endpoint does not.
4. Sprint 3's `paymentService.createOrder` and `verifyPayment` were explicitly kept on raw fetch (Pattern C) because "wrapping them in axiosInstance adds no value and changes the call shape." The same principle applies here: these POST endpoints do not benefit from the 401 interceptor, and changing from raw fetch to axiosInstance is a gratuitous transport change in a migration sprint.

### ADR-5: Support `exptalkrequest` vs Dashboard `requestExpertTalk` -- keep separate

**Chosen**: New `submitExpertCallRequest` in `supportService.ts` (Pattern B-POST to api.php).
**Rejected**: Reuse `dashboardService.requestExpertTalk`.

**Rationale**: These are different backend routes:
- `dashboardService.requestExpertTalk` posts to `/api/dashboard/expert-talk` (REST route, axiosInstance, Pattern A).
- `support/page.tsx` and `interact.tsx` post to `api.php` with `gofor: "exptalkrequest"` in the body (raw fetch, Pattern B-POST).

The backend may route these to the same handler, but the API contract is different (REST path vs gofor field). Reusing the dashboard function would change the transport shape for the support callers, which violates the migration principle of wrapping existing calls without changing behavior. If the backend consolidates these routes in the future, the service functions can be unified then.

### ADR-6: POST functions return `Response`, not parsed JSON

**Chosen**: `submitSupportRequest`, `submitFeedback`, `submitExpertCallRequest` return `Promise<Response>`.
**Rejected**: Return a parsed/normalised response object.

**Rationale**: The existing callers check `response.ok` for success and show a toast. They do not parse the response body. The support/page.tsx feedback POST (line 230) does not even call `.json()` on the response. Returning the raw `Response` object preserves the caller's existing contract. If the caller needs parsed data in the future (e.g., to extract a ticket ID), the return type can be narrowed then. This is consistent with the "passthrough" normalisation philosophy established in Sprint 4 for functions where callers own the success check.

### ADR-7: `GeoItem` vs reusing `LocationResult` for geo functions

**Chosen**: New `GeoItem` interface `{ id: string; name: string }`.
**Rejected**: Reuse existing `LocationResult` from Sprint 4.

**Rationale**: `LocationResult` has an index signature `[key: string]: unknown` because the location search API returns additional geo fields. The country/state/city APIs return a minimal `{ id, name }` shape with no additional fields. Using `LocationResult` would allow callers to assume extra fields exist, which they do not. A clean `GeoItem` type with no index signature is more precise and prevents property-access bugs. The MyProfile.tsx component already maps to `{ id: string, name: string }` -- `GeoItem` is an exact match.

---

## Response Normalisation Decisions

### `getFullAdsList` -- envelope unwrap

Backend returns `{ status: boolean, data?: SupportAd[] }`. Service checks `status === true && Array.isArray(data)` and returns the data array. Returns `[]` on failure. Callers receive `SupportAd[]` -- never the envelope. This matches the pattern established in Sprint 4 (`getChecklist` envelope unwrap).

### `getUserHelpList` / `getUserFeedbackList` / `getUserExpertTalkList` -- envelope unwrap

Backend returns `{ data?: T[] }`. Service extracts `data` with `Array.isArray` guard, returns `[]` on failure. Callers receive flat arrays.

### `getPrivacyPolicy` / `getReturnPolicy` / `getTermsAndConditions` -- text passthrough

Backend returns raw HTML as response body (not JSON). Service calls `res.text()` and returns `Promise<string>`. Callers render via `HtmlRenderer` component. No normalisation needed.

### `getFaqsFiltered` -- array guard

Backend returns `FAQ[]` directly (no envelope). Service applies `Array.isArray(data) ? data : []` as a defensive guard against unexpected empty or non-array responses. This differs from the existing `getFaqs()` which does not guard (it trusts the response shape). The guard is added for `getFaqsFiltered` because the support page sets state directly from the return value (`setFaqs(data || [])` at line 102), and the existing code already handles the `|| []` fallback -- the service absorbs this responsibility.

### Geo functions (`getCountries`, `getStates`, `getCities`) -- id-to-string normalisation

External API returns `{ id: number|string, name: string }`. Service maps `id` to `String(c.id)` for type consistency with `GeoItem.id: string`. This matches the existing normalisation in `MyProfile.tsx` (line 311: `({ id: String(c.id), name: String(c.name) })`).

---

## Caller Update Table

| Caller File | Imports From | Functions Imported | Raw Calls Replaced |
|-------------|-------------|-------------------|-------------------|
| `src/app/support/page.tsx` | `contentService.ts` | `getFaqsFiltered` | Line 99-100 (faqlist with params) |
| `src/app/support/page.tsx` | `supportService.ts` | `getFullAdsList`, `submitSupportRequest`, `submitExpertCallRequest`, `submitFeedback` | Lines 120 (fulladsnamelist), 149-162 (needhelp POST), 181-193 (exptalkrequest POST), 216-229 (feedback POST) |
| `src/app/support/page.tsx` | `@/types/api` | `SupportAd` (for local `Ad` type replacement) | Local `Ad` interface (line 28-31) removed |
| `src/app/myaccount/_components/interact.tsx` | `supportService.ts` | `getUserHelpList`, `getUserFeedbackList`, `getUserExpertTalkList`, `getFullAdsList`, `submitSupportRequest`, `submitFeedback`, `submitExpertCallRequest` | Lines 247-249 (Promise.all GETs), 274 (fulladsnamelist), 294-307 (needhelp POST), 338-348 (feedback POST), 371-383 (exptalkrequest POST) |
| `src/app/myaccount/_components/interact.tsx` | `supportService.ts` | (same functions) | Lines 314 (userhelplist reload), 355 (userfeedbacklist reload), 389 (userexptalkreqlist reload) -- secondary inline reloads |
| `src/app/myaccount/_components/interact.tsx` | `@/types/api` | `SupportItem`, `FeedbackItem`, `ExpertTalkItem`, `SupportAd` | Local type definitions (lines 30-66, 199-202) removed |
| `src/app/myaccount/_components/feedback-form.tsx` | `supportService.ts` | `getFullAdsList`, `submitFeedback` | Lines 55-56 (fulladsnamelist), 75-85 (feedback POST) |
| `src/app/myaccount/_components/policies.tsx` | `supportService.ts` | `getPrivacyPolicy`, `getReturnPolicy`, `getTermsAndConditions` | Lines 40-43 (Promise.all for 3 policy fetches) |
| `src/app/myaccount/_components/MyProfile.tsx` | `referenceDataService.ts` | `getCountries`, `getStates`, `getCities` | Lines 309 (countrieslist), 332 (stateslist), 370 (citieslist) |
| `src/types/api.ts` | -- | -- | Append Sprint 5 interfaces after line 656 |

### Type Imports Required Per Service File

| Service File | Imports from `@/types/api` | Imports from other modules |
|-------------|---------------------------|---------------------------|
| `supportService.ts` (new) | `SupportAd`, `SupportAdListResponse`, `SupportItem`, `FeedbackItem`, `ExpertTalkItem`, `UserListResponse`, `SupportRequestPayload`, `FeedbackPayload`, `ExpertCallPayload` | None (no axiosInstance) |
| `contentService.ts` (extend) | `FAQ` (already imported) | None (no new imports needed) |
| `referenceDataService.ts` (extend) | `GeoItem` (add to existing import block) | None |

---

## Implementation Sequencing Constraint

1. **Phase 1 -- Types**: Append Sprint 5 interfaces to `src/types/api.ts` (after line 656)
2. **Phase 2 -- Services** (order does not matter within this phase):
   - `src/services/supportService.ts` CREATE
   - `src/services/contentService.ts` EXTEND (append `getFaqsFiltered`)
   - `src/services/referenceDataService.ts` EXTEND (append geo functions + add `GeoItem` import)
3. **Phase 3 -- Caller migration** (order matters for testing):
   - `policies.tsx` FIRST (simplest -- 3 unauthenticated GETs, no user_id)
   - `feedback-form.tsx` SECOND (2 functions, small file)
   - `support/page.tsx` THIRD (5 functions, largest migration, includes filtered FAQ)
   - `interact.tsx` FOURTH (7 function calls including secondary reloads, depends on same supportService)
   - `MyProfile.tsx` LAST (geo functions only, independent of supportService)

---

## Anti-Pattern Rules for This Sprint

### AP-001 -- Module-scope cookie capture (carried forward from Sprint 1)

Service functions MUST NOT read cookies. `userId` is passed as a parameter by the calling component. The cookie read stays inside `useEffect`, `onSubmit`, or equivalent component-scoped code.

Sprint 5 specific:
- `interact.tsx` line 211: `const userId = Cookies.get("userId") || "5"` -- this is component-function scope (inside `Interact()` body), which is acceptable per AP-001. However, the `|| "5"` fallback is suspicious (hardcoded default user). The service does NOT replicate this fallback -- if the caller passes `"5"`, the service fetches data for user 5. The caller owns fallback logic.
- `feedback-form.tsx` line 38: `const userId = Cookies.get('userId')` -- component-function scope, acceptable.
- `support/page.tsx` line 117, 147, 179, 213: `Cookies.get('userId')` inside handler functions -- acceptable.

### AP-007 -- axiosInstance import path (carried forward from Sprint 1)

Not applicable to Sprint 5. No service file in this sprint imports axiosInstance. `supportService.ts` uses raw fetch exclusively (ADR-3, ADR-4). `contentService.ts` and `referenceDataService.ts` already do not use axiosInstance.

### AP-008 -- PHP file endpoints always use raw fetch (carried forward from Sprint 4)

Not directly applicable to Sprint 5 (no PHP file endpoints like `.php` other than `api.php`). Carried forward for reference.

### AP-009 -- Policy endpoints return text, not JSON (NEW for Sprint 5)

`getPrivacyPolicy`, `getReturnPolicy`, and `getTermsAndConditions` return `Promise<string>` obtained via `res.text()`. They MUST NOT call `res.json()`. The backend returns raw HTML for these three gofor values. Using `.json()` would throw a parse error because the response is not valid JSON.

### AP-010 -- gofor abstracted inside service (NEW for Sprint 5)

All three POST service functions (`submitSupportRequest`, `submitFeedback`, `submitExpertCallRequest`) inject `gofor` into the body internally. Callers MUST NOT include `gofor` in the payload they pass to these functions. The payload interfaces (`SupportRequestPayload`, `FeedbackPayload`, `ExpertCallPayload`) intentionally omit the `gofor` field. This is consistent with the principle established in Sprint 4 N-002 (AdalyzeChatBot expert talk -- drop gofor field).

### AP-011 -- No axiosInstance in supportService.ts (NEW for Sprint 5)

`supportService.ts` is a raw-fetch-only service file. It MUST NOT import or use `axiosInstance`. All 10 functions use `fetch` directly. See ADR-3 and ADR-4 for the rationale. If a future sprint adds an endpoint that requires auth header validation (true 401 behavior), create a separate `supportAuthService.ts` rather than mixing patterns in this file.

---

## Frozen Files

These files MUST NOT be modified by Sprint 5 implementation:

| File | Constraint |
|------|-----------|
| `src/configs/axios/index.js` | axiosInstance config locked (Sprint 1). No changes. |
| `src/types/api.ts` lines 1-656 | Sprint 1 + Sprint 2 + Sprint 3 + Sprint 4 interfaces. Append-only freeze. Sprint 5 starts at line 657+. |
| `src/lib/eventTracker.ts` | Hard freeze -- bare fetch with offline queue is intentional. |
| `src/services/cookieConsentService.ts` | Frozen Sprint 1. |
| `src/services/dashboardService.ts` | Sprint 3 complete. Sprint 5 does NOT import from or modify it. |
| `src/services/adService.ts` | Sprint 3 complete. Not touched by Sprint 5. |
| `src/services/paymentService.ts` | Sprint 3 complete. Not touched by Sprint 5. |
| `src/services/pricingService.ts` | Sprint 3 complete. Not touched by Sprint 5. |
| `src/services/checklistService.ts` | Sprint 3 complete. Not touched by Sprint 5. |
| `src/services/resultsService.ts` | Sprint 4 complete. Not touched by Sprint 5. |
| `src/services/chatService.ts` | Sprint 4 complete. Not touched by Sprint 5. |
| `src/services/abService.ts` | Sprint 4 complete. Not touched by Sprint 5. |
| `src/services/contentService.ts` lines 1-47 | Sprint 3 functions. Append-only. Do NOT modify `getFaqs()` or any existing function. |
| `src/services/referenceDataService.ts` lines 1-29 | Sprint 4 functions. Append-only. Do NOT modify `getIndustries()` or `getLocations()`. The `LOCATION_API_BASE` constant and header comment are frozen. |
| `src/app/upload/type.tsx` | Existing `Industry` interface. Not touched. |
| `src/app/results/_components/FixThisAdDrawer.tsx` | Frozen -- carried forward. |
| `src/components/expert-form.tsx` | Out of scope (shared popup component). Its internal fetch calls are not migrated in Sprint 5. |

---

## Key Implementation Notes

### N-001: referenceDataService import block update

When extending `referenceDataService.ts`, the new `GeoItem` type must be added to the existing import from `@/types/api`. The current import (line 9) is:
```typescript
import type { LocationResult } from "@/types/api";
```
After Sprint 5:
```typescript
import type { GeoItem, LocationResult } from "@/types/api";
```

### N-002: interact.tsx local type removal

After migration, the locally defined types in `interact.tsx` must be REMOVED:
- `SupportItem` (lines 30-41) -- replaced by import from `@/types/api`
- `FeedbackItem` (lines 43-53) -- replaced by import from `@/types/api`
- `ExpertItem` (lines 55-66) -- replaced by `ExpertTalkItem` from `@/types/api`
- `Ad` (lines 199-202) -- replaced by `SupportAd` from `@/types/api`

Note the rename: local `ExpertItem` becomes `ExpertTalkItem` in `@/types/api` for consistency with `userexptalkreqlist`.

### N-003: support/page.tsx local interface removal

The local `FAQ` interface (lines 18-25) and `Ad` interface (lines 27-30) must be REMOVED after migration. `FAQ` is already in `@/types/api` (Sprint 3). `Ad` is replaced by `SupportAd`.

### N-004: support/page.tsx inline client-side FAQ filter

After migrating to `getFaqsFiltered`, the client-side `filteredFaqs` filter (lines 136-141) becomes redundant for the search dimension (the server already filters by search). However, the existing code applies BOTH server-side filtering (via the fetch URL) AND client-side filtering (via the `filteredFaqs` computed array). The dev must evaluate whether to keep the client-side filter as a secondary guard or remove it. This is a UI behavior decision, not a service layer decision. The service function does not change either way.

### N-005: encodeURIComponent on user_id

All `getFullAdsList`, `getUserHelpList`, `getUserFeedbackList`, `getUserExpertTalkList` apply `encodeURIComponent(userId)` to the query string. The existing code does NOT encode user_id (e.g., `&user_id=${userId}`). In practice, user_id is always a numeric string so encoding has no effect. But applying it is a correctness improvement consistent with Sprint 4's N-005 (location search encoding). This does not change behavior.

### N-006: POST functions and gofor injection

The three POST functions spread the payload and prepend `gofor`:
```typescript
body: JSON.stringify({ gofor: "needhelp", ...payload, imgname: payload.imgname || "" })
```
The `gofor` field MUST come before the spread to ensure it is always present. If a future caller accidentally includes `gofor` in their payload, the spread would override the service-injected value. The TypeScript interfaces do not include `gofor`, so this would be a type error at compile time (AP-010).
