# Migration Lead Spec — api-svc-004

**Lead**: Migration Lead (Level 2)
**Date**: 2026-04-11
**Sprint**: 4 — Results, Chat, A/B, Reference Data services
**Downstream agent**: `nexus:level-3:nextjs-developer-agent`
**Validation level**: full-plus

---

## Scope

4 new service files + 4 caller file updates + 1 types file append.

| File | Action |
|------|--------|
| `src/types/api.ts` | Append Sprint 4 interfaces after line 577 |
| `src/services/resultsService.ts` | **CREATE** |
| `src/services/chatService.ts` | **CREATE** |
| `src/services/abService.ts` | **CREATE** |
| `src/services/referenceDataService.ts` | **CREATE** |
| `src/app/results/page.tsx` | **UPDATE** — replace 4 raw fetch blocks |
| `src/app/results/_components/AdalyzeChatBot.tsx` | **UPDATE** — replace 3 inline fetch blocks, remove 2 local interfaces |
| `src/app/ab-results/page.tsx` | **UPDATE** — replace 3 raw fetch blocks |
| `src/app/ab-test/page.tsx` | **UPDATE** — replace 2 raw fetch blocks |

**DO NOT TOUCH (frozen)**:
- `src/configs/axios/index.js`
- `src/types/api.ts` lines 1–577
- `src/lib/eventTracker.ts`
- `src/services/cookieConsentService.ts`
- `src/services/dashboardService.ts`
- `src/app/results/_components/FixThisAdDrawer.tsx`
- `src/app/upload/type.tsx`
- All `support/page.tsx`, `interact.tsx`, `myprofile/`, `upload/page.tsx`, `register/`, blog, landing pages

---

## Step 1 — Append to `src/types/api.ts`

**Read the file first** (currently 577 lines). Append the following block at line 578 — after the closing brace of `ChecklistMutationResult`. Do NOT modify lines 1–577.

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

## Step 2 — Create `src/services/resultsService.ts`

Create this file with the following **exact** content:

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

---

## Step 3 — Create `src/services/chatService.ts`

Create this file with the following **exact** content:

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

---

## Step 4 — Create `src/services/abService.ts`

Create this file with the following **exact** content:

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

---

## Step 5 — Create `src/services/referenceDataService.ts`

Create this file with the following **exact** content:

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
 * CORS is handled by the external server.
 * encodeURIComponent is applied to handle spaces, ampersands, and special chars.
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

## Step 6 — Update `src/app/results/page.tsx`

**Read the file first.** Apply the following 4 replacements in order. Do NOT modify any other lines.

### Replacement 6-A: Import block — add resultsService imports

Add the import for the new service. The existing import block ends around line 44 (before `export default function ResultsPage`). Insert after the existing last import line.

**old_string** (exact text to find):
```
import { getAdIdFromUrlParams, isTokenExpired, generateShareUrl, generateShareText, parseUserIdFromToken } from "@/lib/tokenUtils"
import { trackEvent } from "@/lib/eventTracker"
import Footer from "@/components/footer"
```

**new_string**:
```
import { getAdIdFromUrlParams, isTokenExpired, generateShareUrl, generateShareText, parseUserIdFromToken } from "@/lib/tokenUtils"
import { trackEvent } from "@/lib/eventTracker"
import Footer from "@/components/footer"
import { getAdDetail, getHeatmap, generateHeatmap, deleteAd } from "@/services/resultsService"
```

---

### Replacement 6-B: handleDeleteAd — replace raw fetch with deleteAd service call

**old_string** (exact text to find — the entire try block inside handleDeleteAd):
```
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=deletead&ad_upload_id=${adId}`)

      if (!response.ok) {
        throw new Error('Failed to delete ad')
      }

      const result = await response.json()

      if (result.response === "Ad Deleted") {
        toast.success("Ad deleted successfully")
        // Redirect to my-ads page after successful deletion
        router.push('/my-ads')
      } else {
        throw new Error('Unexpected response from server')
      }
    } catch (error) {
      console.error('Error deleting ad:', error)
      toast.error('Failed to delete ad. Please try again.')
    } finally {
      setDeleteLoading(false)
      setDeleteDialogOpen(false)
    }
```

**new_string**:
```
    try {
      const result = await deleteAd(adId)

      if (result.response === "Ad Deleted") {
        toast.success("Ad deleted successfully")
        // Redirect to my-ads page after successful deletion
        router.push('/my-ads')
      } else {
        throw new Error('Unexpected response from server')
      }
    } catch (error) {
      console.error('Error deleting ad:', error)
      toast.error('Failed to delete ad. Please try again.')
    } finally {
      setDeleteLoading(false)
      setDeleteDialogOpen(false)
    }
```

---

### Replacement 6-C: handleFetchHeatmap — replace dual raw fetch blocks with getHeatmap/generateHeatmap service calls

The component logic (if heatmapStatus === 1 call getHeatmap, else call generateHeatmap) remains in the component. Only the fetch mechanics are replaced.

**old_string** (exact text to find — the entire try/catch/finally inside handleFetchHeatmap):
```
    try {
      let result: any;

      if (heatmapStatus === 1) {
        // If heatmapstatus is 1, call GET endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=getheatmap&ad_upload_id=${adId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch heatmap')
        }

        result = await response.json()

        // Parse heatmap_json string to get zones
        if (result.heatmap_json) {
          try {
            const parsedHeatmap = JSON.parse(result.heatmap_json)
            if (parsedHeatmap.zones && Array.isArray(parsedHeatmap.zones)) {
              setHeatmapData(parsedHeatmap)
              setShowHeatmapOverlay(true)
            } else {
              throw new Error('Invalid heatmap data structure')
            }
          } catch (parseError) {
            console.error('Error parsing heatmap_json:', parseError)
            throw new Error('Failed to parse heatmap data')
          }
        } else {
          throw new Error('No heatmap data found in response')
        }
      } else {
        // If heatmapstatus is 0 or undefined, call POST endpoint (default behavior)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/heatmap.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ad_upload_id: Number(adId)
          })
        })

        if (!response.ok) {
          throw new Error('Failed to fetch heatmap')
        }

        result = await response.json()

        if (result.heatmap && result.heatmap.zones) {
          setHeatmapData(result.heatmap)
          setShowHeatmapOverlay(true)
        } else {
          throw new Error('Invalid heatmap data')
        }
      }
    } catch (error) {
      console.error('Error fetching heatmap:', error)
      toast.error('Failed to load heatmap. Please try again.')
    } finally {
      setHeatmapLoading(false)
    }
```

**new_string**:
```
    try {
      if (heatmapStatus === 1) {
        // If heatmapstatus is 1, call GET endpoint
        const result = await getHeatmap(adId)

        // Parse heatmap_json string to get zones
        if (result.heatmap_json) {
          try {
            const parsedHeatmap = JSON.parse(result.heatmap_json)
            if (parsedHeatmap.zones && Array.isArray(parsedHeatmap.zones)) {
              setHeatmapData(parsedHeatmap)
              setShowHeatmapOverlay(true)
            } else {
              throw new Error('Invalid heatmap data structure')
            }
          } catch (parseError) {
            console.error('Error parsing heatmap_json:', parseError)
            throw new Error('Failed to parse heatmap data')
          }
        } else {
          throw new Error('No heatmap data found in response')
        }
      } else {
        // If heatmapstatus is 0 or undefined, call POST endpoint (default behavior)
        const result = await generateHeatmap(Number(adId))

        if (result.heatmap && result.heatmap.zones) {
          setHeatmapData(result.heatmap)
          setShowHeatmapOverlay(true)
        } else {
          throw new Error('Invalid heatmap data')
        }
      }
    } catch (error) {
      console.error('Error fetching heatmap:', error)
      toast.error('Failed to load heatmap. Please try again.')
    } finally {
      setHeatmapLoading(false)
    }
```

---

### Replacement 6-D: Token-based addetail useEffect — replace raw fetch with getAdDetail service call

**old_string** (exact text to find — the fetchAdDetails async function body inside the first addetail useEffect):
```
    const fetchAdDetails = async () => {
      try {
        const shareToken = searchParams.get('token') || searchParams.get('ad-token') || searchParams.get('top10-token') || searchParams.get('trending-token');
        let userIdParam = '';
        if (shareToken) {
          const userIdFromToken = parseUserIdFromToken(shareToken);
          if (userIdFromToken) {
            userIdParam = `&user_id=${userIdFromToken}`;
          }
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=addetail&ad_upload_id=${adUploadId}${userIdParam}`);
        if (!response.ok) throw new Error('Failed to fetch ad details');
        const result = await response.json();
        if (!result.success) throw new Error(result.message || 'API returned error');
        if (!didCancel) setApiData(result.data);
      } catch (err) {
        if (!didCancel) setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        if (!didCancel) setLoading(false);
      }
    };
```

**new_string**:
```
    const fetchAdDetails = async () => {
      try {
        const shareToken = searchParams.get('token') || searchParams.get('ad-token') || searchParams.get('top10-token') || searchParams.get('trending-token');
        let userId: string | undefined;
        if (shareToken) {
          const userIdFromToken = parseUserIdFromToken(shareToken);
          if (userIdFromToken) {
            userId = userIdFromToken;
          }
        }
        const data = await getAdDetail(adUploadId, userId);
        if (!didCancel) setApiData(data);
      } catch (err) {
        if (!didCancel) setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        if (!didCancel) setLoading(false);
      }
    };
```

---

### Replacement 6-E: UserDetails-based addetail useEffect — replace raw fetch with getAdDetail service call

**old_string** (exact text to find — the fetchAdDetails async function body inside the second addetail useEffect):
```
    const fetchAdDetails = async () => {
      try {
        let userIdParam = '';
        if (userDetails?.user_id) {
          userIdParam = `&user_id=${userDetails.user_id}`;
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=addetail&ad_upload_id=${adUploadId}${userIdParam}`);
        if (!response.ok) throw new Error('Failed to fetch ad details');
        const result = await response.json();
        if (!result.success) throw new Error(result.message || 'API returned error');
        if (!didCancel) setApiData(result.data);
      } catch (err) {
        if (!didCancel) setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        if (!didCancel) setLoading(false);
      }
    };
```

**new_string**:
```
    const fetchAdDetails = async () => {
      try {
        const userId = userDetails?.user_id;
        const data = await getAdDetail(adUploadId, userId);
        if (!didCancel) setApiData(data);
      } catch (err) {
        if (!didCancel) setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        if (!didCancel) setLoading(false);
      }
    };
```

**Note on state type**: `apiData` is typed as `ApiResponse | null` (local type from `./type`). After migration the service returns `AdDetailData`. If the compiler raises a type error, add `as unknown as ApiResponse` to the `setApiData(data)` call: `setApiData(data as unknown as ApiResponse)`. Do NOT change the state variable declaration or the `ApiResponse` import — the local type is used throughout the rest of the component.

---

## Step 7 — Update `src/app/results/_components/AdalyzeChatBot.tsx`

**Read the file first.** Apply the following replacements in order.

### Replacement 7-A: Import block — add chatService and dashboardService imports, add type imports from @/types/api

**old_string** (exact text to find — the top import block):
```
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, UserRound, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AIChatIcon from "@/assets/ai-chat-icon.png";
import Image from 'next/image';
import ExpertConsultationPopup from '@/components/expert-form';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
```

**new_string**:
```
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, UserRound, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AIChatIcon from "@/assets/ai-chat-icon.png";
import Image from 'next/image';
import ExpertConsultationPopup from '@/components/expert-form';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { getChatHistory, askAdalyze } from '@/services/chatService';
import { requestExpertTalk } from '@/services/dashboardService';
import type { AskAdalyzeResponse, ChatLogEntry, ExpertTalkPayload } from '@/types/api';
```

---

### Replacement 7-B: Remove local AskAPIResponse and ChatLogEntry interface definitions

These two interfaces are now in `@/types/api.ts`. Remove them. The local `ChatMessage` interface and `Sender` type above them MUST remain — they are component-local UI types.

**old_string** (exact text to find):
```
interface AskAPIResponse {
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

interface ChatLogEntry {
    al_id: number;
    ad_upload_id: number;
    user_id: number;
    question: string;
    answer: string;
    created_date: string;
}
```

**new_string** (empty — delete these interfaces entirely):
```
```

**Note**: After deletion, the line above this block (`}` closing `ChatMessage`) is immediately followed by `interface AdalyzeChatBotProps`. The blank line between them can be preserved or removed — either is acceptable.

---

### Replacement 7-C: loadHistoryOrInitial — replace raw getchathistory fetch with getChatHistory service call

The sorting, mapping, and conditional logic that runs AFTER the fetch stays in the component unchanged. Only the fetch mechanics are replaced.

**old_string** (exact text to find):
```
            try {
                const historyRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=getchathistory&ad_upload_id=${adUploadId}`,
                    { cache: 'no-store' }
                );

                const raw = await historyRes.text();
                let parsed: unknown = raw;
                try {
                    parsed = JSON.parse(raw);
                } catch {
                    // keep as text; may be "0"
                }

                const isZero = parsed === 0 || parsed === "0";
                const isArray = Array.isArray(parsed);

                if (isArray && (parsed as ChatLogEntry[]).length > 0) {
                    const entries = parsed as ChatLogEntry[];
```

**new_string**:
```
            try {
                const entries = await getChatHistory(adUploadId);

                const isArray = Array.isArray(entries);

                if (isArray && entries.length > 0) {
```

**Important follow-on edit**: The existing code after the if-block has `} else if (isZero || (isArray && (parsed as any[]).length === 0)) {`. After the replacement above, `isZero` and `parsed` no longer exist. Replace that else-if condition:

**old_string** (exact text to find — immediately after the if block above):
```
                } else if (isZero || (isArray && (parsed as any[]).length === 0)) {
```

**new_string**:
```
                } else if (isArray && entries.length === 0) {
```

---

### Replacement 7-D: runInitial — replace raw askadalyze.php fetch (initial call, empty question)

**old_string** (exact text to find — the fetch call inside runInitial):
```
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/askadalyze.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ad_upload_id: adUploadId, question: "" })
            });
            const data: AskAPIResponse = await res.json();
```

**new_string**:
```
        try {
            const data: AskAdalyzeResponse = await askAdalyze({ ad_upload_id: adUploadId, question: "" });
```

---

### Replacement 7-E: sendQuestion — replace raw askadalyze.php fetch (user question)

**old_string** (exact text to find — the fetch call inside sendQuestion):
```
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/askadalyze.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ad_upload_id: adUploadId, question })
                });

                const data: AskAPIResponse = await res.json();
```

**new_string**:
```
            try {
                const data: AskAdalyzeResponse = await askAdalyze({ ad_upload_id: adUploadId, question });
```

---

### Replacement 7-F: ExpertConsultationPopup onSubmit — replace raw POST exptalkrequest with requestExpertTalk

The userId cookie read stays in the component (AP-001 compliance). The gofor field is dropped — requestExpertTalk abstracts it internally.

**old_string** (exact text to find — the entire try block inside the onSubmit handler):
```
                    try {
                        const userId = Cookies.get("userId");
                        if (!userId) {
                            toast.error('User ID not found. Please log in again.');
                            throw new Error('User ID not found');
                        }

                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                gofor: 'exptalkrequest',
                                user_id: userId,
                                prefdate: formData.prefdate,
                                preftime: formData.preftime,
                                comments: formData.comments
                            })
                        });

                        if (response.ok) {
                            toast.success('Expert call request submitted successfully!');
                            // Show success message in chat
                            appendMessage({
                                id: crypto.randomUUID(),
                                sender: 'ai',
                                text: 'Your consultation request has been submitted successfully. Our expert will contact you soon!'
                            });
                        } else {
                            throw new Error('Failed to submit request');
                        }
                    } catch (error) {
                        console.error('Error submitting expert call request:', error);
                        toast.error(error instanceof Error ? error.message : 'Failed to submit expert call request. Please try again.');
                        throw error;
                    }
```

**new_string**:
```
                    try {
                        const userId = Cookies.get("userId");
                        if (!userId) {
                            toast.error('User ID not found. Please log in again.');
                            throw new Error('User ID not found');
                        }

                        const expertPayload: ExpertTalkPayload = {
                            user_id: Number(userId),
                            prefdate: formData.prefdate,
                            preftime: formData.preftime,
                            comments: formData.comments,
                        };
                        await requestExpertTalk(expertPayload);
                        toast.success('Expert call request submitted successfully!');
                        // Show success message in chat
                        appendMessage({
                            id: crypto.randomUUID(),
                            sender: 'ai',
                            text: 'Your consultation request has been submitted successfully. Our expert will contact you soon!'
                        });
                    } catch (error) {
                        console.error('Error submitting expert call request:', error);
                        toast.error(error instanceof Error ? error.message : 'Failed to submit expert call request. Please try again.');
                        throw error;
                    }
```

---

## Step 8 — Update `src/app/ab-results/page.tsx`

**Read the file first.** Apply the following 3 replacements in order.

### Replacement 8-A: Import block — add resultsService and abService imports

**old_string** (exact text to find):
```
import { getAdIdFromUrlParams, parseUserIdFromToken } from "@/lib/tokenUtils"
import { ABTestResult, ApiResponse } from "./type";
```

**new_string**:
```
import { getAdIdFromUrlParams, parseUserIdFromToken } from "@/lib/tokenUtils"
import { ABTestResult, ApiResponse } from "./type";
import { getAdDetail } from "@/services/resultsService";
import { getAbAdDetail, deleteAbAd } from "@/services/abService";
```

---

### Replacement 8-B: fetchAdDetails useEffect — replace dual raw addetail fetches with getAdDetail service calls

**old_string** (exact text to find — the entire try block inside fetchAdDetails):
```
            try {
                const tokenA = searchParams.get("ad-token-a");
                const tokenB = searchParams.get("ad-token-b");
                const adIdA = tokenA ? getAdIdFromUrlParams(new URLSearchParams({ 'ad-token': tokenA })) : searchParams.get("ad_id_a") || "";
                const adIdB = tokenB ? getAdIdFromUrlParams(new URLSearchParams({ 'ad-token': tokenB })) : searchParams.get("ad_id_b") || "";

                const token = tokenA || tokenB;
                let userIdParam = '';
                if (token) {
                    const userIdFromToken = parseUserIdFromToken(token);
                    if (userIdFromToken) {
                        userIdParam = `&user_id=${userIdFromToken}`;
                    }
                } else if (userDetails?.user_id) {
                    // If no token but userDetails available, use that user_id
                    userIdParam = `&user_id=${userDetails.user_id}`;
                }
                if (!adIdA || !adIdB) throw new Error("Missing ad IDs for comparison");
                const [responseA, responseB] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=addetail&ad_upload_id=${adIdA}${userIdParam}`),
                    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=addetail&ad_upload_id=${adIdB}${userIdParam}`),
                ]);
                if (!responseA.ok || !responseB.ok) throw new Error("Failed to fetch ad details");
                const [resultA, resultB] = await Promise.all([responseA.json(), responseB.json()]);
                setAdDataA(resultA.data || resultA);
                setAdDataB(resultB.data || resultB);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
```

**new_string**:
```
            try {
                const tokenA = searchParams.get("ad-token-a");
                const tokenB = searchParams.get("ad-token-b");
                const adIdA = tokenA ? getAdIdFromUrlParams(new URLSearchParams({ 'ad-token': tokenA })) : searchParams.get("ad_id_a") || "";
                const adIdB = tokenB ? getAdIdFromUrlParams(new URLSearchParams({ 'ad-token': tokenB })) : searchParams.get("ad_id_b") || "";

                const token = tokenA || tokenB;
                let userId: string | number | undefined;
                if (token) {
                    const userIdFromToken = parseUserIdFromToken(token);
                    if (userIdFromToken) {
                        userId = userIdFromToken;
                    }
                } else if (userDetails?.user_id) {
                    // If no token but userDetails available, use that user_id
                    userId = userDetails.user_id;
                }
                if (!adIdA || !adIdB) throw new Error("Missing ad IDs for comparison");
                const [adDataA, adDataB] = await Promise.all([
                    getAdDetail(adIdA, userId),
                    getAdDetail(adIdB, userId),
                ]);
                setAdDataA(adDataA as unknown as ApiResponse);
                setAdDataB(adDataB as unknown as ApiResponse);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
```

**Note**: `as unknown as ApiResponse` is needed because `AdDetailData` (returned by `getAdDetail`) and the local `ApiResponse` type (from `./type`) are structurally compatible but not declared as such. Both have index signatures. This cast is safe.

---

### Replacement 8-C: fetchABTestWinner — replace raw abaddetail fetch with getAbAdDetail service call

**old_string** (exact text to find — the fetch block inside fetchABTestWinner):
```
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=abaddetail&ad_upload_id1=${adIdA}&ad_upload_id2=${adIdB}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setAbTestResult(result);
```

**new_string**:
```
            const result = await getAbAdDetail(adIdA, adIdB);
            setAbTestResult(result as unknown as ABTestResult);
```

**Note**: `as unknown as ABTestResult` is needed because `AbAdDetailResult` (from `@/types/api`) and the local `ABTestResult` type (from `./type`) are structurally compatible but separate declarations. Both have `recommended_ad` and `reason` fields plus an index signature. This cast is safe.

---

### Replacement 8-D: handleDeleteAbAd — replace raw deleteabad fetch with deleteAbAd service call

**old_string** (exact text to find — the try block inside handleDeleteAbAd):
```
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=deleteabad&ad_upload_id_a=${adIdA}&ad_upload_id_b=${adIdB}`);

            if (!response.ok) {
                throw new Error('Failed to delete A/B ad');
            }

            const result = await response.json();

            if (result.response === "AB Ad Deleted") {
                toast.success("A/B ad deleted successfully");
                // Redirect to my-ads page after successful deletion
                router.push('/my-ads');
            } else {
                throw new Error('Unexpected response from server');
            }
        } catch (error) {
            console.error('Error deleting A/B ad:', error);
            toast.error('Failed to delete A/B ad. Please try again.');
        } finally {
            setDeleteLoading(false);
            setDeleteDialogOpen(false);
        }
```

**new_string**:
```
        try {
            const result = await deleteAbAd(adIdA, adIdB);

            if (result.response === "AB Ad Deleted") {
                toast.success("A/B ad deleted successfully");
                // Redirect to my-ads page after successful deletion
                router.push('/my-ads');
            } else {
                throw new Error('Unexpected response from server');
            }
        } catch (error) {
            console.error('Error deleting A/B ad:', error);
            toast.error('Failed to delete A/B ad. Please try again.');
        } finally {
            setDeleteLoading(false);
            setDeleteDialogOpen(false);
        }
```

---

## Step 9 — Update `src/app/ab-test/page.tsx`

**Read the file first.** Apply the following 2 replacements in order.

### Replacement 9-A: Import block — add referenceDataService import

The existing import line `import { Industry } from "../upload/type"` is already present (line 20). Do NOT remove it — referenceDataService.ts imports from `@/app/upload/type` internally, but the page still needs `Industry` for the `industries` state type.

**old_string** (exact text to find):
```
import { Industry } from "../upload/type"
import { generateAdToken } from "@/lib/tokenUtils"
```

**new_string**:
```
import { Industry } from "../upload/type"
import { generateAdToken } from "@/lib/tokenUtils"
import { getIndustries, getLocations } from "@/services/referenceDataService"
```

---

### Replacement 9-B: fetchIndustries function — replace raw fetch with getIndustries service call

**old_string** (exact text to find — the entire fetchIndustries function):
```
    const fetchIndustries = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=industrylist`)
            if (!response.ok) {
                throw new Error('Failed to fetch industries')
            }
            const data: Industry[] = await response.json()
            setIndustries(data)
        } catch (error) {
            console.error('Error fetching industries:', error)
            toast.error('Failed to load industries')
        } finally {
        }
    }
```

**new_string**:
```
    const fetchIndustries = async () => {
        try {
            const data = await getIndustries()
            setIndustries(data)
        } catch (error) {
            console.error('Error fetching industries:', error)
            toast.error('Failed to load industries')
        }
    }
```

---

### Replacement 9-C: fetchCountries function — replace raw fetch with getLocations service call

The caller's merging logic (preserving selected countries, combining with new results) stays in the component unchanged. Only the fetch mechanics are replaced.

**old_string** (exact text to find — the fetch block inside fetchCountries):
```
        try {
            const response = await fetch(`https://techades.com/App/api.php?gofor=locationlist&search=${searchTerm}`)
            if (!response.ok) {
                throw new Error('Failed to fetch countries')
            }
            const data = await response.json()

            // Get currently selected country names to preserve them
            const selectedCountryNames = getCountryNamesFromIds(country)
```

**new_string**:
```
        try {
            const data = await getLocations(searchTerm)

            // Get currently selected country names to preserve them
            const selectedCountryNames = getCountryNamesFromIds(country)
```

---

## Step 10 — Verification

After all steps are applied, run the following validation commands from the project root `/Users/mugunthansrinivasan/Project/adalyze-ai`.

### 10-A: Confirm new service files exist

```bash
ls -1 src/services/resultsService.ts src/services/chatService.ts src/services/abService.ts src/services/referenceDataService.ts
```

Expected: all 4 files listed with no errors.

### 10-B: Confirm Sprint 4 types were appended

```bash
grep -n "AdDetailData\|ChatLogEntry\|AbAdDetailResult\|LocationResult" src/types/api.ts | tail -20
```

Expected: matches found at line numbers 580+ (after the Sprint 3 block ending at 577).

### 10-C: Confirm no raw fetch calls remain for migrated endpoints

```bash
grep -rn "gofor=deletead\|gofor=getheatmap\|gofor=addetail\|gofor=getchathistory\|gofor=abaddetail\|gofor=deleteabad\|gofor=industrylist\|gofor=exptalkrequest\|heatmap\.php\|askadalyze\.php" \
  src/app/results/page.tsx \
  src/app/results/_components/AdalyzeChatBot.tsx \
  src/app/ab-results/page.tsx \
  src/app/ab-test/page.tsx
```

Expected: **zero lines output**. Any match is a migration gap.

The `locationlist` fetch is now inside `referenceDataService.ts` (correct). Verify it was removed from the caller:

```bash
grep -n "locationlist\|techades.com/App" src/app/ab-test/page.tsx
```

Expected: zero lines output.

### 10-D: Confirm service imports are present in callers

```bash
grep -n "resultsService\|chatService\|abService\|referenceDataService\|dashboardService" \
  src/app/results/page.tsx \
  src/app/results/_components/AdalyzeChatBot.tsx \
  src/app/ab-results/page.tsx \
  src/app/ab-test/page.tsx
```

Expected: each caller file has at least one matching import line.

### 10-E: Confirm local duplicate interfaces were removed from AdalyzeChatBot.tsx

```bash
grep -n "interface AskAPIResponse\|interface ChatLogEntry" src/app/results/_components/AdalyzeChatBot.tsx
```

Expected: zero lines output. Both interfaces are now in `src/types/api.ts`.

### 10-F: TypeScript compile check

```bash
npx tsc --noEmit 2>&1 | grep -E "resultsService|chatService|abService|referenceDataService|AdalyzeChatBot|ab-results|ab-test" | head -30
```

Expected: no errors referencing these files. If `as unknown as ApiResponse` or `as unknown as ABTestResult` casts produce errors, review the local type shape in `./type` — the cast may need adjustment if the local type has non-compatible required fields.

### 10-G: Frozen file check

```bash
git diff --name-only src/configs/axios/index.js src/lib/eventTracker.ts src/services/cookieConsentService.ts src/services/dashboardService.ts src/app/results/_components/FixThisAdDrawer.tsx src/app/upload/type.tsx
```

Expected: **no output** (none of these files modified).

---

## Anti-Pattern Checklist (developer must verify before committing)

| Check | Rule |
|-------|------|
| No cookie reads in service files | AP-001: `getCookies`, `Cookies.get` must never appear in `resultsService.ts`, `chatService.ts`, `abService.ts`, or `referenceDataService.ts` |
| No relative imports for axios | AP-007: All service files import from `@/configs/axios`, never `../../configs/axios` |
| heatmap.php and askadalyze.php use raw fetch | AP-008: `generateHeatmap` and `askAdalyze` use `fetch()`, never `axiosInstance` |
| locationlist uses hardcoded techades.com URL | `getLocations` uses `LOCATION_API_BASE` constant, never `NEXT_PUBLIC_API_BASE_URL` |
| getAdDetail strips absent userId | N-001: params object built conditionally — undefined/null/empty userId must not appear in query string |
| requestExpertTalk called without gofor field | N-002: `ExpertTalkPayload` does not include `gofor` — the dashboardService abstracts it |
| No getAdDetail defined in chatService | chatService.ts has only `getChatHistory` and `askAdalyze` |
| getAdDetail in ab-results imported from resultsService | Import path: `@/services/resultsService` |
| getChatHistory always returns array | getChatHistory normalises "0"/0 to `[]` — callers never need to check for numeric 0 |
| Sprint 3 types not modified | Lines 1–577 of `src/types/api.ts` unchanged |
