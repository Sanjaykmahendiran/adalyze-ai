# Architecture Design -- api-svc-004

Architect: Solution Architect (Level 1C)
Date: 2026-04-11
Scope: Sprint 4 service layer -- results, chat, A/B, reference data
Depends on: api-svc-003-architect.md (immutable HTTP patterns, AP-001 through AP-007)

---

## Service File Map

Four new service files. One cross-service import reuse and one cross-sprint import reuse.

| File | gofor / endpoints covered | HTTP Pattern | Rationale |
|------|--------------------------|-------------|-----------|
| `src/services/resultsService.ts` | `addetail`, `getheatmap`, `deletead`, `heatmap.php` (POST) | D, D, D, C (raw fetch) | Co-locates all results-page API calls. `addetail` is shared with `ab-results/page.tsx` (single implementation, imported cross-page). `heatmap.php` is a PHP endpoint -- raw fetch, same class as `razorpay.php` (Pattern C). |
| `src/services/chatService.ts` | `getchathistory`, `askadalyze.php` (POST) | D, C (raw fetch) | Chat domain isolation. `getchathistory` is authenticated gofor (Pattern D). `askadalyze.php` is a PHP file endpoint -- raw fetch (Pattern C, AP-008). |
| `src/services/abService.ts` | `abaddetail`, `deleteabad` | D, D | A/B comparison domain. Both are authenticated gofor calls. Individual ad detail for A/B pages is NOT here -- imported from `resultsService.ts` (BR-005). |
| `src/services/referenceDataService.ts` | `industrylist`, `locationlist` | B, external | Reference/lookup data. Both are unauthenticated. `industrylist` uses Pattern B (raw fetch, same origin). `locationlist` uses external raw fetch (hardcoded `techades.com` URL). This is the only service file mixing two raw-fetch patterns -- see R5 comment directive below. |

### Import Reuse (no new functions)

| Caller | Function | Source | Notes |
|--------|----------|--------|-------|
| `ab-results/page.tsx` | `getAdDetail` | `resultsService.ts` (new) | BR-005: single implementation of `addetail` |
| `AdalyzeChatBot.tsx` | `requestExpertTalk` | `dashboardService.ts` (Sprint 3) | BR-004: existing function, no change to signature. Caller drops inline `gofor` field -- service abstracts it. |

---

## TypeScript Interfaces (Sprint 4 additions)

These append after line 577 of `src/types/api.ts` (the closing brace of `ChecklistMutationResult`). Lines 1-577 (Sprint 1 + Sprint 2 + Sprint 3) are frozen -- append-only, no edits.

```typescript
// ── Sprint 4 additions ───────────────────────────────────────────────────────

// ── Results service ──────────────────────────────────────────────────────────

/**
 * AdDetailResponse -- envelope returned by GET api.php?gofor=addetail.
 * success: true indicates valid data. message carries error text on failure.
 * Callers check success before accessing data.
 */
export interface AdDetailResponse {
  success: boolean;
  message?: string;
  data: AdDetailData;
}

/**
 * AdDetailData -- the ad detail payload inside AdDetailResponse.data.
 *
 * Only fields consumed by results/page.tsx and ab-results/page.tsx that
 * affect branching logic are typed explicitly. The backend returns 50+ fields
 * accessed via dynamic property access throughout the page (e.g.,
 * current?.visual_clarity, current?.cta_visibility). These are captured by
 * the index signature. As the codebase matures and pages adopt strict typing,
 * fields can be promoted from the index signature to explicit properties.
 *
 * heatmapstatus: 0 = not generated, 1 = generated (controls GET vs POST path).
 * platform_suits / platform_notsuits: arrays consumed by platform suitability UI.
 */
export interface AdDetailData {
  heatmapstatus: number;
  platform_suits?: unknown[];
  platform_notsuits?: unknown[];
  [key: string]: unknown;
}

/**
 * HeatmapGetResponse -- from GET api.php?gofor=getheatmap.
 * heatmap_json is a JSON-encoded string. Callers must JSON.parse() it
 * to extract the zones array: { zones: HeatmapZone[] }.
 */
export interface HeatmapGetResponse {
  heatmap_json: string;
}

/**
 * HeatmapGenerateResponse -- from POST heatmap.php.
 * Returns the parsed heatmap object directly (not JSON-encoded).
 */
export interface HeatmapGenerateResponse {
  heatmap: {
    zones: unknown[];
  };
}

/**
 * DeleteAdResponse -- from GET api.php?gofor=deletead.
 * Success: response === "Ad Deleted".
 */
export interface DeleteAdResponse {
  response: string;
}

// ── Chat service ─────────────────────────────────────────────────────────────

/**
 * ChatLogEntry -- single chat history record from getchathistory.
 * al_id is the auto-increment PK used for sort tiebreaking.
 * Backend may return "0", 0, or ChatLogEntry[] -- the service normalises
 * "0"/0 to empty array before returning.
 */
export interface ChatLogEntry {
  al_id: number;
  ad_upload_id: number;
  user_id: number;
  question: string;
  answer: string;
  created_date: string;
}

/**
 * AskAdalyzePayload -- body for POST askadalyze.php.
 */
export interface AskAdalyzePayload {
  ad_upload_id: number;
  question: string;
}

/**
 * AskAdalyzeResponse -- from POST askadalyze.php.
 * Backend uses inconsistent casing for count/limit fields (ask_count vs askCount).
 * Both variants are typed. Callers must check both (e.g., data.ask_count ?? data.askCount).
 * limit_reached / limitReached: same dual-casing pattern.
 */
export interface AskAdalyzeResponse {
  answer?: string;
  suggested_questions?: string[];
  ask_count?: number;
  ask_limit?: number;
  askCount?: number;
  askLimit?: number;
  limit_reached?: boolean;
  limitReached?: boolean;
  error?: string;
}

// ── A/B service ──────────────────────────────────────────────────────────────

/**
 * AbAdDetailResult -- from GET api.php?gofor=abaddetail.
 * recommended_ad: the winning ad identifier. reason: explanation text.
 * Additional comparison metrics may be present -- index signature captures them.
 */
export interface AbAdDetailResult {
  recommended_ad: string;
  reason: string;
  [key: string]: unknown;
}

/**
 * DeleteAbAdResponse -- from GET api.php?gofor=deleteabad.
 * Success: response === "AB Ad Deleted".
 */
export interface DeleteAbAdResponse {
  response: string;
}

// ── Reference data service ───────────────────────────────────────────────────

/**
 * LocationResult -- item from locationlist (techades.com external API).
 * id and name are the only fields consumed by ab-test/page.tsx.
 * The external API may return additional geo fields -- index signature captures them.
 *
 * Note: Industry type is NOT defined here. It lives in @/app/upload/type.tsx
 * (shared with the upload page). referenceDataService.ts imports it from there.
 */
export interface LocationResult {
  id: string;
  name: string;
  [key: string]: unknown;
}
```

---

## Function Signatures

### `src/services/resultsService.ts`

```typescript
import { axiosInstance } from "@/configs/axios";
import type {
  AdDetailResponse,
  AdDetailData,
  HeatmapGetResponse,
  HeatmapGenerateResponse,
  DeleteAdResponse,
} from "@/types/api";

/**
 * getAdDetail -- fetch ad detail by ID, optionally scoped to a user.
 *
 * Pattern D: axiosInstance.get("/api.php", { params }).
 *
 * userId is optional. When absent or empty, the user_id param MUST be
 * omitted from the request -- not sent as undefined, null, or empty string.
 * Implementation: build params object conditionally, then pass to axios.
 *
 * Returns AdDetailData (the unwrapped .data payload).
 * Throws on !success or network error -- callers catch and set error state.
 *
 * Shared by: results/page.tsx (2 call-sites) and ab-results/page.tsx (2 call-sites).
 */
export const getAdDetail = async (
  adUploadId: string | number,
  userId?: string | number
): Promise<AdDetailData> => {
  const params: Record<string, string | number> = {
    gofor: "addetail",
    ad_upload_id: adUploadId,
  };
  if (userId !== undefined && userId !== "" && userId !== null) {
    params.user_id = userId;
  }
  const response = await axiosInstance.get<AdDetailResponse>("/api.php", {
    params,
  });
  if (!response.data.success) {
    throw new Error(response.data.message || "API returned error");
  }
  return response.data.data;
};

/**
 * getHeatmap -- fetch pre-generated heatmap data (when heatmapstatus === 1).
 *
 * Pattern D: axiosInstance.get("/api.php", { params }).
 *
 * Returns the raw HeatmapGetResponse. Caller is responsible for
 * JSON.parse(result.heatmap_json) to extract zones.
 */
export const getHeatmap = async (
  adUploadId: string | number
): Promise<HeatmapGetResponse> => {
  const response = await axiosInstance.get<HeatmapGetResponse>("/api.php", {
    params: { gofor: "getheatmap", ad_upload_id: adUploadId },
  });
  return response.data;
};

/**
 * generateHeatmap -- trigger heatmap generation (when heatmapstatus === 0).
 *
 * Pattern C: raw fetch to heatmap.php (PHP file endpoint -- NOT axiosInstance).
 * Same classification as razorpay.php / verify.php (AP-008).
 *
 * ad_upload_id is sent as number (matching existing POST body).
 */
export const generateHeatmap = async (
  adUploadId: number
): Promise<HeatmapGenerateResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/heatmap.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad_upload_id: adUploadId }),
    }
  );
  if (!res.ok) throw new Error(`generateHeatmap failed: ${res.status}`);
  return res.json() as Promise<HeatmapGenerateResponse>;
};

/**
 * deleteAd -- delete a single ad by upload ID.
 *
 * Pattern D: axiosInstance.get("/api.php", { params }).
 *
 * Returns DeleteAdResponse. Caller checks response === "Ad Deleted".
 */
export const deleteAd = async (
  adUploadId: string | number
): Promise<DeleteAdResponse> => {
  const response = await axiosInstance.get<DeleteAdResponse>("/api.php", {
    params: { gofor: "deletead", ad_upload_id: adUploadId },
  });
  return response.data;
};
```

### `src/services/chatService.ts`

```typescript
import { axiosInstance } from "@/configs/axios";
import type {
  ChatLogEntry,
  AskAdalyzePayload,
  AskAdalyzeResponse,
} from "@/types/api";

/**
 * getChatHistory -- fetch chat history for an ad.
 *
 * Pattern D: axiosInstance.get("/api.php", { params }).
 *
 * NORMALISATION: Backend returns one of:
 *   - ChatLogEntry[] (array of history entries)
 *   - "0" (string zero -- no history)
 *   - 0 (numeric zero -- no history)
 *
 * This function normalises "0" and 0 to an empty array.
 * Callers always receive ChatLogEntry[].
 *
 * Implementation note: axios parses JSON automatically, but the backend
 * may return bare "0" (not valid JSON object). Use responseType: 'text'
 * or handle the parsed value defensively. Recommended approach:
 *   const raw = response.data;
 *   if (raw === 0 || raw === "0" || !Array.isArray(raw)) return [];
 *   return raw as ChatLogEntry[];
 */
export const getChatHistory = async (
  adUploadId: string | number
): Promise<ChatLogEntry[]> => {
  const response = await axiosInstance.get("/api.php", {
    params: { gofor: "getchathistory", ad_upload_id: adUploadId },
  });
  const raw = response.data;
  if (raw === 0 || raw === "0" || !Array.isArray(raw)) return [];
  return raw as ChatLogEntry[];
};

/**
 * askAdalyze -- send a question to the Adalyze AI chatbot.
 *
 * Pattern C: raw fetch to askadalyze.php (PHP file endpoint -- NOT axiosInstance).
 * Same classification as heatmap.php, razorpay.php (AP-008).
 *
 * question: empty string triggers initial suggestions (first load).
 * Non-empty string is a user question.
 */
export const askAdalyze = async (
  payload: AskAdalyzePayload
): Promise<AskAdalyzeResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/askadalyze.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) throw new Error(`askAdalyze failed: ${res.status}`);
  return res.json() as Promise<AskAdalyzeResponse>;
};
```

### `src/services/abService.ts`

```typescript
import { axiosInstance } from "@/configs/axios";
import type {
  AbAdDetailResult,
  DeleteAbAdResponse,
} from "@/types/api";

/**
 * getAbAdDetail -- fetch A/B comparison result for two ads.
 *
 * Pattern D: axiosInstance.get("/api.php", { params }).
 *
 * Returns the raw comparison result including recommended_ad and reason.
 * Callers consume the full object (e.g., setAbTestResult(result)).
 */
export const getAbAdDetail = async (
  adUploadId1: string | number,
  adUploadId2: string | number
): Promise<AbAdDetailResult> => {
  const response = await axiosInstance.get<AbAdDetailResult>("/api.php", {
    params: {
      gofor: "abaddetail",
      ad_upload_id1: adUploadId1,
      ad_upload_id2: adUploadId2,
    },
  });
  return response.data;
};

/**
 * deleteAbAd -- delete an A/B ad pair.
 *
 * Pattern D: axiosInstance.get("/api.php", { params }).
 *
 * Returns DeleteAbAdResponse. Caller checks response === "AB Ad Deleted".
 */
export const deleteAbAd = async (
  adUploadIdA: string | number,
  adUploadIdB: string | number
): Promise<DeleteAbAdResponse> => {
  const response = await axiosInstance.get<DeleteAbAdResponse>("/api.php", {
    params: {
      gofor: "deleteabad",
      ad_upload_id_a: adUploadIdA,
      ad_upload_id_b: adUploadIdB,
    },
  });
  return response.data;
};
```

### `src/services/referenceDataService.ts`

```typescript
// ──────────────────────────────────────────────────────────────────────────────
// IMPORTANT: This service mixes two raw-fetch patterns (Pattern B + external).
// Neither function uses axiosInstance. Do NOT add authenticated (Pattern D)
// functions to this file. If an authenticated reference-data endpoint is
// needed in the future, create a new service file for it.
// ──────────────────────────────────────────────────────────────────────────────

import type { Industry } from "@/app/upload/type";
import type { LocationResult } from "@/types/api";

/**
 * LOCATION_API_BASE -- hardcoded external domain for location lookups.
 * This URL is NOT the application's own API. It points to techades.com
 * and must NEVER be replaced with NEXT_PUBLIC_API_BASE_URL or routed
 * through axiosInstance.
 */
const LOCATION_API_BASE = "https://techades.com/App/api.php";

/**
 * getIndustries -- fetch the full industry list.
 *
 * Pattern B: raw fetch, unauthenticated, same origin.
 * No user_id, no auth header.
 */
export const getIndustries = async (): Promise<Industry[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=industrylist`
  );
  if (!res.ok) throw new Error(`getIndustries failed: ${res.status}`);
  return res.json() as Promise<Industry[]>;
};

/**
 * getLocations -- search locations by term (debounced by caller).
 *
 * External raw fetch: hardcoded techades.com URL.
 * axiosInstance MUST NOT be used (external domain, not proxied).
 * CORS is handled by the external server -- Sprint 4 does not change transport.
 */
export const getLocations = async (
  searchTerm: string
): Promise<LocationResult[]> => {
  const res = await fetch(
    `${LOCATION_API_BASE}?gofor=locationlist&search=${encodeURIComponent(searchTerm)}`
  );
  if (!res.ok) throw new Error(`getLocations failed: ${res.status}`);
  return res.json() as Promise<LocationResult[]>;
};
```

---

## HTTP Pattern Assignment Summary

| Function | Service File | Pattern | Client | Auth |
|----------|-------------|---------|--------|------|
| `getAdDetail` | `resultsService.ts` | D | `axiosInstance.get("/api.php", { params: { gofor: "addetail", ad_upload_id, user_id? } })` | Yes |
| `getHeatmap` | `resultsService.ts` | D | `axiosInstance.get("/api.php", { params: { gofor: "getheatmap", ad_upload_id } })` | Yes |
| `generateHeatmap` | `resultsService.ts` | C | `fetch("${env}/heatmap.php", { method: "POST", body })` | No (PHP file) |
| `deleteAd` | `resultsService.ts` | D | `axiosInstance.get("/api.php", { params: { gofor: "deletead", ad_upload_id } })` | Yes |
| `getChatHistory` | `chatService.ts` | D | `axiosInstance.get("/api.php", { params: { gofor: "getchathistory", ad_upload_id } })` | Yes |
| `askAdalyze` | `chatService.ts` | C | `fetch("${env}/askadalyze.php", { method: "POST", body })` | No (PHP file) |
| `getAbAdDetail` | `abService.ts` | D | `axiosInstance.get("/api.php", { params: { gofor: "abaddetail", ad_upload_id1, ad_upload_id2 } })` | Yes |
| `deleteAbAd` | `abService.ts` | D | `axiosInstance.get("/api.php", { params: { gofor: "deleteabad", ad_upload_id_a, ad_upload_id_b } })` | Yes |
| `getIndustries` | `referenceDataService.ts` | B | `fetch("${env}/api.php?gofor=industrylist")` | No |
| `getLocations` | `referenceDataService.ts` | external | `fetch("https://techades.com/App/api.php?gofor=locationlist&search=${term}")` | No |
| `requestExpertTalk` | `dashboardService.ts` **(existing)** | -- | Import only, no new function | -- |
| `getAdDetail` | `resultsService.ts` **(reuse)** | -- | Imported into `ab-results/page.tsx`, no new function | -- |

---

## Response Normalisation Decisions

### `getAdDetail` -- envelope unwrap

Backend returns `{ success: boolean; message?: string; data: AdDetailData }`. The service checks `success === true`, throws on failure (with `message` as error text), and returns `data` directly. Callers receive `AdDetailData` -- never the envelope.

**Important for ab-results/page.tsx:** The current code does `resultA.data || resultA` (defensive fallback). After migration, `getAdDetail` always returns `AdDetailData` (already unwrapped). The `|| resultA` fallback is no longer needed and should be dropped by the dev during caller migration.

### `getChatHistory` -- zero normalisation

Backend returns `ChatLogEntry[] | "0" | 0`. The service normalises `"0"` and `0` to `[]`. Callers always receive `ChatLogEntry[]`.

Implementation: axios auto-parses JSON. The response `0` (bare integer) parses to `number`. The response `"0"` may parse to `string` depending on Content-Type header. The defensive check `raw === 0 || raw === "0" || !Array.isArray(raw)` covers all edge cases.

### `getHeatmap` -- passthrough

Returns `HeatmapGetResponse` as-is. Callers are responsible for `JSON.parse(result.heatmap_json)` to extract zones. The parse is caller-side because it involves error handling (`try/catch` around JSON.parse) and state updates that are page-specific.

### `generateHeatmap` -- passthrough

Returns `HeatmapGenerateResponse` as-is. Callers access `result.heatmap.zones`.

### `deleteAd` / `deleteAbAd` -- passthrough

Both return the raw response object. Callers check `result.response === "Ad Deleted"` or `result.response === "AB Ad Deleted"` respectively. The success-string check is caller business logic (controls toast message and redirect destination).

### `askAdalyze` -- passthrough

Returns `AskAdalyzeResponse` as-is. The dual-casing fields (`ask_count`/`askCount`, `limit_reached`/`limitReached`) are the caller's responsibility to reconcile. The service does not normalise these because both casing variants appear in the existing component logic and may have different backend code paths.

### `getAbAdDetail` -- passthrough

Returns `AbAdDetailResult` as-is. Callers consume `result.recommended_ad` and `result.reason` directly.

---

## Caller Update Table

Each row identifies a source file that must be updated, what it imports, and which raw fetch calls it replaces.

| Caller File | Imports From | Functions Imported | Raw Calls Replaced |
|-------------|-------------|-------------------|-------------------|
| `src/app/results/page.tsx` | `resultsService.ts` | `getAdDetail`, `getHeatmap`, `generateHeatmap`, `deleteAd` | Lines 554 (deletead), 602 (getheatmap), 629 (heatmap.php POST), 681 (addetail), 717 (addetail) |
| `src/app/results/_components/AdalyzeChatBot.tsx` | `chatService.ts` | `getChatHistory`, `askAdalyze` | Lines 141-142 (getchathistory), 117 (askadalyze.php initial), 233 (askadalyze.php question) |
| `src/app/results/_components/AdalyzeChatBot.tsx` | `dashboardService.ts` | `requestExpertTalk` | Line 568 (exptalkrequest POST) |
| `src/app/results/_components/AdalyzeChatBot.tsx` | `@/types/api` | `ExpertTalkPayload` | (type import for the reused function) |
| `src/app/ab-results/page.tsx` | `resultsService.ts` | `getAdDetail` | Lines 81, 82 (addetail x2 in Promise.all) |
| `src/app/ab-results/page.tsx` | `abService.ts` | `getAbAdDetail`, `deleteAbAd` | Lines 172 (abaddetail), 208 (deleteabad) |
| `src/app/ab-test/page.tsx` | `referenceDataService.ts` | `getIndustries`, `getLocations` | Lines 132 (industrylist), 234 (locationlist) |
| `src/types/api.ts` | -- | -- | Append Sprint 4 interfaces after line 577 |

### Type Imports Required Per Service File

| Service File | Imports from `@/types/api` | Imports from other modules |
|-------------|---------------------------|---------------------------|
| `resultsService.ts` | `AdDetailResponse`, `AdDetailData`, `HeatmapGetResponse`, `HeatmapGenerateResponse`, `DeleteAdResponse` | `axiosInstance` from `@/configs/axios` |
| `chatService.ts` | `ChatLogEntry`, `AskAdalyzePayload`, `AskAdalyzeResponse` | `axiosInstance` from `@/configs/axios` |
| `abService.ts` | `AbAdDetailResult`, `DeleteAbAdResponse` | `axiosInstance` from `@/configs/axios` |
| `referenceDataService.ts` | `LocationResult` | `Industry` from `@/app/upload/type` |

---

## Implementation Sequencing Constraint

The intra-sprint dependency from the BA spec (Section 5) is architecturally confirmed:

1. **Phase 1 -- Types**: Append Sprint 4 interfaces to `src/types/api.ts`
2. **Phase 2 -- Services** (order matters):
   - `resultsService.ts` FIRST (creates `getAdDetail` needed by Phase 3)
   - `chatService.ts` (independent)
   - `abService.ts` (independent, but `getAbAdDetail` tests may reference results types)
   - `referenceDataService.ts` (independent)
3. **Phase 3 -- Caller migration** (order matters):
   - `results/page.tsx` (uses only `resultsService`)
   - `AdalyzeChatBot.tsx` (uses `chatService` + existing `dashboardService`)
   - `ab-results/page.tsx` (uses `resultsService.getAdDetail` + `abService`) -- must come after `resultsService.ts` exists
   - `ab-test/page.tsx` (uses `referenceDataService`)

---

## Key Implementation Notes

### N-001: getAdDetail -- strip undefined user_id (Risk R1 resolution)

The `userId` parameter must not appear in the query string when absent. Axios serialises `undefined` params as the literal string `"undefined"` in some configurations. The implementation MUST build the params object conditionally:

```typescript
const params: Record<string, string | number> = {
  gofor: "addetail",
  ad_upload_id: adUploadId,
};
if (userId !== undefined && userId !== "" && userId !== null) {
  params.user_id = userId;
}
```

Do NOT use: `{ gofor: "addetail", ad_upload_id: adUploadId, user_id: userId }` -- this sends `user_id=undefined`.

### N-002: AdalyzeChatBot expert talk -- drop gofor field (Risk R3 resolution)

The current inline POST body includes `gofor: 'exptalkrequest'`. The existing `requestExpertTalk` in `dashboardService.ts` already abstracts this -- it posts to `/api/dashboard/expert-talk` with the `ExpertTalkPayload` shape `{ user_id, prefdate, preftime, comments }`. The caller MUST NOT include `gofor` in the payload when calling the imported function.

The `userId` is read from `Cookies.get("userId")` inside the `onSubmit` handler (line 562). After migration, the cookie read stays in the component (AP-001 compliance) and `user_id` is passed as `Number(userId)` to match `ExpertTalkPayload.user_id: number`.

### N-003: getChatHistory -- text parsing defensiveness

The existing code (AdalyzeChatBot.tsx line 146) reads the response as `.text()` first, then tries `JSON.parse()`, falling back to the raw string. When using `axiosInstance`, axios auto-parses JSON. However, the backend may return a bare `0` with `Content-Type: text/html` (common in PHP). The axios response interceptor handles this correctly -- `response.data` will be the number `0`. The defensive check `raw === 0 || raw === "0"` covers both cases.

### N-004: ab-results/page.tsx -- drop defensive fallback

Current code: `setAdDataA(resultA.data || resultA)`. After migration, `getAdDetail` returns `AdDetailData` (already unwrapped). The caller should simplify to: `const adDataA = await getAdDetail(adIdA, userId)` -- no `||` fallback.

### N-005: referenceDataService -- encodeURIComponent for location search

The existing code (ab-test/page.tsx line 234) does NOT encode the search term: `?gofor=locationlist&search=${searchTerm}`. The service function MUST apply `encodeURIComponent(searchTerm)` to prevent query string injection and handle special characters (spaces, ampersands) correctly. This is a correctness improvement, not a behavioral change -- the existing code works only because users typically type simple location names.

### N-006: generateHeatmap -- ad_upload_id as number

The existing code (results/page.tsx line 635) sends `ad_upload_id: Number(adId)`. The service function parameter is typed as `number` to match. Callers must convert string ad IDs to numbers before calling.

### N-007: AdalyzeChatBot local type removal

After migration, the locally defined `AskAPIResponse` (line 24) and `ChatLogEntry` (line 36) interfaces in `AdalyzeChatBot.tsx` must be REMOVED. These types are now in `@/types/api.ts` as `AskAdalyzeResponse` and `ChatLogEntry`. The local `ChatMessage` interface (line 17) and `Sender` type (line 15) are NOT moved -- they are component-local UI types, not API response types.

---

## Anti-Pattern List

### AP-001 -- Module-scope cookie capture (carried forward from Sprint 1)

Service functions MUST NOT read cookies. `userId` and any user-scoped identifiers must be passed as parameters by the calling component. The cookie read stays inside `useEffect`, `onSubmit`, or equivalent component-scoped code.

Sprint 4 specific: `AdalyzeChatBot.tsx` line 562 reads `Cookies.get("userId")` inside the `onSubmit` callback -- this is correct (component-scoped). Do not move this read into `chatService.ts`.

### AP-007 -- axiosInstance import path (carried forward from Sprint 1)

All service files MUST import from `@/configs/axios`. Never use relative imports like `../../configs/axios/index.js`.

Applies to: `resultsService.ts`, `chatService.ts`, `abService.ts`. Does NOT apply to `referenceDataService.ts` (no axiosInstance usage).

### AP-008 -- PHP file endpoints always use raw fetch (NEW for Sprint 4)

`heatmap.php` and `askadalyze.php` are PHP file endpoints. They MUST use raw `fetch`, NEVER `axiosInstance`. This is the same classification as `razorpay.php` and `verify.php` (Sprint 3, Pattern C).

Rationale: PHP file endpoints are not behind the API gateway's session management. The 401 interceptor in axiosInstance does not apply. Raw fetch preserves the existing transport behavior and avoids unintended interceptor side effects.

Affected functions: `generateHeatmap` (resultsService.ts), `askAdalyze` (chatService.ts).

---

## Frozen File Constraints

These files MUST NOT be modified by Sprint 4 implementation:

| File | Constraint |
|------|-----------|
| `src/configs/axios/index.js` | axiosInstance config locked (Sprint 1). No changes. |
| `src/types/api.ts` lines 1-577 | Sprint 1 + Sprint 2 + Sprint 3 interfaces. Append-only freeze. Sprint 4 starts at line 578+. |
| `src/lib/eventTracker.ts` | Hard freeze -- bare fetch with offline queue is intentional. |
| `src/services/cookieConsentService.ts` | Frozen Sprint 1. |
| `src/services/dashboardService.ts` | Sprint 3 complete. Sprint 4 imports from it but does NOT modify it. |
| `src/app/results/_components/FixThisAdDrawer.tsx` | Frozen -- carried forward from Sprint 3. |
| `src/app/upload/type.tsx` | Existing `Industry` interface. Sprint 4 imports it but does NOT modify it. |

---

## Architecture Decision Log

| # | Decision | Chosen | Rejected | Reason |
|---|----------|--------|----------|--------|
| 1 | `generateHeatmap` HTTP pattern | Raw fetch (Pattern C) | axiosInstance (Pattern D) | heatmap.php is a PHP file endpoint, same class as razorpay.php. AP-008. No 401 interceptor benefit. |
| 2 | `askAdalyze` HTTP pattern | Raw fetch (Pattern C) | axiosInstance (Pattern D) | askadalyze.php is a PHP file endpoint. AP-008. Consistent with Pattern C established in Sprint 3. |
| 3 | `getAdDetail` return shape | Unwrapped `AdDetailData` | Full `AdDetailResponse` envelope | Both callers (results, ab-results) access `.data` immediately. Unwrapping in the service eliminates repeated `.data` access and the defensive `|| result` fallback in ab-results. |
| 4 | `getChatHistory` normalisation | Service normalises "0"/0 to [] | Caller normalises | The "0"/0 edge case is a backend quirk, not caller business logic. Normalising in the service means all current and future callers get a clean array without knowing about the quirk. |
| 5 | `AdDetailData` typing strategy | Minimal explicit fields + index signature | Full 50+ field interface | Only `heatmapstatus`, `platform_suits`, `platform_notsuits` affect branching logic. All other fields are accessed via dynamic patterns (`current?.field_name`). Index signature `[key: string]: unknown` captures these without creating a brittle 50-field interface that breaks on backend changes. |
| 6 | `AskAdalyzeResponse` dual-casing | Keep both casing variants in the type | Normalise to one casing | Backend inconsistency is not ours to fix. Callers already handle both. Normalising in the service would require choosing one variant and could break if a backend code path returns only the other. |
| 7 | `Industry` type location | Keep in `@/app/upload/type.tsx`, import from there | Move to `@/types/api.ts` | `Industry` is already used by both `upload/page.tsx` and `ab-test/page.tsx`. Moving it would require updating existing imports in those files, which is out of Sprint 4 scope (upload page is not in scope). Import from existing location. |
| 8 | `LocationResult` type location | New in `@/types/api.ts` | Define in `referenceDataService.ts` | API response types belong in `api.ts` per established convention. Service files import types; they do not define them. |
| 9 | `generateHeatmap` placement | `resultsService.ts` | Separate `heatmapService.ts` | Only one consumer (results/page.tsx). Creating a separate service for a single function is over-engineering. Co-location with `getHeatmap` is natural -- same domain (heatmap), same page. |
| 10 | `askAdalyze` placement | `chatService.ts` | `resultsService.ts` | Chat is a distinct domain from ad results. `chatService.ts` isolates the chat API surface. Even though the chatbot is rendered inside the results page, its API calls are functionally independent. |

---

## Risk Mitigations

| Risk (from BA) | Mitigation |
|----------------|-----------|
| R1: `user_id=undefined` in query string | N-001: Conditional params object. Explicit check for undefined/null/empty before adding to params. Tested in unit test. |
| R2: CORS on techades.com locationlist | No transport change in Sprint 4 -- `getLocations` wraps the existing raw fetch identically. If CORS is broken, it is pre-existing. `encodeURIComponent` added for correctness (N-005). |
| R3: `gofor` field in expert talk payload | N-002: `requestExpertTalk` abstracts `gofor` inside the service. Caller passes `ExpertTalkPayload` (no `gofor`). Verified by reading `dashboardService.ts` line 54: posts to `/api/dashboard/expert-talk` with payload directly. |
| R4: Two addetail call-sites in results/page.tsx | Confirmed structurally identical -- both call `api.php?gofor=addetail&ad_upload_id=${id}${userIdParam}`. Differ only in how `userIdParam` is derived (token vs userDetails). Both map to `getAdDetail(adUploadId, userId?)`. |
| R5: Mixed HTTP patterns in referenceDataService.ts | Header comment directive added to service file template (see function signatures section). Explicitly warns against adding authenticated calls to this file. |
