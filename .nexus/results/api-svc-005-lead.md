# Implementation Spec — api-svc-005 (Sprint 5)

**Date**: 2026-04-11
**Lead**: business-logic-lead (Level 2)
**Scope**: Support, Policies, Profile Geo, FAQ Filters
**Depends on**: api-svc-005-architect.md (ADR-1 through ADR-5)
**Builder target**: services-builder, api-routes-builder

---

## Critical Rules for the Builder

- **NO axiosInstance** anywhere in this sprint. `supportService.ts` and all extensions use raw `fetch` only.
- **AP-001**: `Cookies.get` is NEVER called in service files. Components pass `userId` as a function parameter.
- **AP-009**: `getPrivacyPolicy`, `getReturnPolicy`, `getTermsAndConditions` MUST call `response.text()` — NEVER `response.json()`. They return `Promise<string>`.
- **AP-010**: `getFullAdsList` is the single canonical source for ads name lists. All three callers (`support/page.tsx`, `feedback-form.tsx`, `interact.tsx`) import from `supportService.ts` — never inline this fetch.
- **AP-011**: Geo functions share `LOCATION_API_BASE` already declared in `referenceDataService.ts`. Never duplicate this constant.
- `getFaqsFiltered` goes in `contentService.ts` (not supportService). Existing `getFaqs()` is untouched.

---

## Step 1 — Append Sprint 5 interfaces to `src/types/api.ts`

**File**: `/Users/mugunthansrinivasan/Project/adalyze-ai/src/types/api.ts`
**Action**: Append after line 656 (after the closing `}` of `LocationResult`).

The last lines of the file currently are:
```
export interface LocationResult {
  id: string;
  name: string;
  [key: string]: unknown;
}
```

**old_string** (the exact final block to anchor on):
```
// ── Reference data service ───────────────────────────────────────────────────

export interface LocationResult {
  id: string;
  name: string;
  [key: string]: unknown;
}
```

**new_string** (replace with the same block PLUS the Sprint 5 block appended):
```
// ── Reference data service ───────────────────────────────────────────────────

export interface LocationResult {
  id: string;
  name: string;
  [key: string]: unknown;
}

// ── Sprint 5 additions ────────────────────────────────────────────────────────

// ── Support service ───────────────────────────────────────────────────────────

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
 * NOTE: This is distinct from ExpertTalkPayload (Sprint 3, dashboardService).
 * That payload posts to /api/dashboard/expert-talk via axiosInstance (Pattern A).
 * This payload posts to /api.php with gofor in the body and user_id as string.
 */
export interface ExpertCallPayload {
  user_id: string;
  prefdate: string;
  preftime: string;
  comments: string;
}

// ── Reference data service (Sprint 5 geo) ────────────────────────────────────

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

## Step 2 — Append `getFaqsFiltered` to `src/services/contentService.ts`

**File**: `/Users/mugunthansrinivasan/Project/adalyze-ai/src/services/contentService.ts`
**Action**: Append after the final `};` of `getTestimonials`. Do NOT modify any existing function.

**old_string**:
```
export const getTestimonials = async (): Promise<Testimonial[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=testilist`
  );
  if (!res.ok) throw new Error(`testilist failed: ${res.status}`);
  return res.json() as Promise<Testimonial[]>;
};
```

**new_string**:
```
export const getTestimonials = async (): Promise<Testimonial[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=testilist`
  );
  if (!res.ok) throw new Error(`testilist failed: ${res.status}`);
  return res.json() as Promise<Testimonial[]>;
};

/**
 * getFaqsFiltered -- fetch FAQs with category and search filters.
 *
 * Pattern B: raw fetch, unauthenticated, same origin.
 *
 * Intentionally separate from getFaqs() (no params, used by landing page).
 * The support page always passes category and conditionally passes search.
 * These are different UX contracts -- merging them would couple the landing
 * page to filter logic.
 *
 * AP-010 note: This function is NOT getFullAdsList. It lives in contentService
 * because FAQs are content, not support infrastructure.
 *
 * Returns FAQ[] (same type as getFaqs). Empty array on empty/non-array response.
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

---

## Step 3 — Append 3 geo functions to `src/services/referenceDataService.ts`

**File**: `/Users/mugunthansrinivasan/Project/adalyze-ai/src/services/referenceDataService.ts`
**Action**: Two sub-steps.

### Step 3a — Extend the import block to include `GeoItem`

**old_string**:
```
import type { Industry } from "@/app/upload/type";
import type { LocationResult } from "@/types/api";
```

**new_string**:
```
import type { Industry } from "@/app/upload/type";
import type { LocationResult, GeoItem } from "@/types/api";
```

### Step 3b — Append the three geo functions after `getLocations`

**old_string**:
```
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

**new_string**:
```
export const getLocations = async (
  searchTerm: string
): Promise<LocationResult[]> => {
  const res = await fetch(
    `${LOCATION_API_BASE}?gofor=locationlist&search=${encodeURIComponent(searchTerm)}`
  );
  if (!res.ok) throw new Error(`getLocations failed: ${res.status}`);
  return res.json() as Promise<LocationResult[]>;
};

/**
 * getCountries -- fetch full country list.
 *
 * External raw fetch: hardcoded techades.com URL via LOCATION_API_BASE.
 * axiosInstance MUST NOT be used (external domain, not proxied).
 * AP-011: reuses LOCATION_API_BASE -- never duplicate this constant.
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

## Step 4 — CREATE `src/services/supportService.ts`

**File**: `/Users/mugunthansrinivasan/Project/adalyze-ai/src/services/supportService.ts`
**Action**: Create new file. Full content below.

> CRITICAL: NO axiosInstance import or usage. ALL functions use raw `fetch`.
> Policy functions (`getPrivacyPolicy`, `getReturnPolicy`, `getTermsAndConditions`)
> use `res.text()` — NEVER `res.json()`. Return type is `Promise<string>`.

```typescript
// --------------------------------------------------------------------------
// IMPORTANT: This service uses raw fetch for ALL functions.
// Pattern B-GET-Auth (authenticated GET with user_id in query string),
// Pattern B (unauthenticated GET), and Pattern B-POST (POST with gofor in
// JSON body). axiosInstance is NOT used here.
//
// ADR-3: These endpoints accept user_id as a query parameter with no auth
// header validation. They are "soft auth" -- the backend never returns 401
// for these gofor calls, so the axiosInstance 401 interceptor would never
// fire. Raw fetch is correct here.
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

// ── Authenticated GETs (user_id in query string, no auth header) ──────────

/**
 * getFullAdsList -- fetch user's ad names for feedback dropdown.
 *
 * Pattern B-GET-Auth: raw fetch to api.php with user_id in query string.
 * No Authorization header.
 *
 * AP-010: This is the canonical source for ad name lists.
 * All three callers (support/page.tsx, feedback-form.tsx, interact.tsx)
 * MUST import this function. Never inline this fetch in a component.
 *
 * AP-001: userId is passed as parameter -- never read Cookies inside this fn.
 *
 * NORMALISATION: Returns SupportAd[] from envelope.
 * Returns [] when status !== true, data is not an array, or on any error.
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
 * Returns SupportItem[] extracted from envelope { data: SupportItem[] }.
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
 * Returns FeedbackItem[] extracted from envelope { data: FeedbackItem[] }.
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
 * Returns ExpertTalkItem[] extracted from envelope { data: ExpertTalkItem[] }.
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

// ── Unauthenticated GETs (policy documents) ──────────────────────────────

/**
 * getPrivacyPolicy -- fetch privacy policy HTML.
 *
 * Pattern B: raw fetch, unauthenticated.
 *
 * *** AP-009: MUST use res.text() -- NEVER res.json() ***
 * Returns raw HTML string. Callers render via HtmlRenderer component.
 * Return type: Promise<string>
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
 * Pattern B: raw fetch, unauthenticated.
 *
 * *** AP-009: MUST use res.text() -- NEVER res.json() ***
 * Returns raw HTML string.
 * Return type: Promise<string>
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
 * Pattern B: raw fetch, unauthenticated.
 *
 * *** AP-009: MUST use res.text() -- NEVER res.json() ***
 * Returns raw HTML string.
 * Return type: Promise<string>
 */
export const getTermsAndConditions = async (): Promise<string> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=termsandconditions`
  );
  if (!res.ok) throw new Error(`termsandconditions failed: ${res.status}`);
  return res.text();
};

// ── POST mutations ────────────────────────────────────────────────────────

/**
 * submitSupportRequest -- POST a new support ticket.
 *
 * Pattern B-POST: raw fetch POST to api.php with JSON body.
 * gofor is injected by the service. Caller provides SupportRequestPayload.
 * Returns the raw Response (caller checks response.ok for toast).
 * Throws on non-ok response so caller can catch and show error toast.
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
 * Returns the raw Response.
 * Throws on non-ok response.
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
 * Returns the raw Response.
 * Throws on non-ok response so the dialog component can handle re-throw.
 *
 * NOTE (ADR-5): Intentionally separate from dashboardService.requestExpertTalk.
 * That function posts to /api/dashboard/expert-talk via axiosInstance (Pattern A).
 * This function posts to /api.php with gofor in the body (Pattern B-POST).
 * Different backend routes, same domain concept.
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

---

## Step 5 — UPDATE `src/app/support/page.tsx`

**File**: `/Users/mugunthansrinivasan/Project/adalyze-ai/src/app/support/page.tsx`

### Step 5a — Add service imports

**old_string**:
```
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"
import SupportPageSkeleton from "@/components/Skeleton-loading/SupportPageSkeleton"
import ExpertConsultationPopup from "@/components/expert-form"
```

**new_string**:
```
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"
import SupportPageSkeleton from "@/components/Skeleton-loading/SupportPageSkeleton"
import ExpertConsultationPopup from "@/components/expert-form"
import { getFaqsFiltered } from "@/services/contentService"
import { getFullAdsList, submitSupportRequest, submitExpertCallRequest, submitFeedback } from "@/services/supportService"
import type { SupportRequestPayload, ExpertCallPayload, FeedbackPayload } from "@/types/api"
```

### Step 5b — Remove local `interface Ad` (now typed as `SupportAd` from the service)

The component uses `Ad[]` locally; after migration the `getFullAdsList` service returns `SupportAd[]`. Keep the local `FAQ` interface (it is still used), remove the local `Ad` interface, and use `SupportAd` from the service.

**old_string**:
```
interface FAQ {
  faq_id: number
  question: string
  answer: string
  category: string
  status: number
  created_date: string
}

interface Ad {
  ad_id: number
  ads_name: string
}
```

**new_string**:
```
interface FAQ {
  faq_id: number
  question: string
  answer: string
  category: string
  status: number
  created_date: string
}
```

### Step 5c — Update `ads` state type to `SupportAd`

**old_string**:
```
  const [ads, setAds] = useState<Ad[]>([])
```

**new_string**:
```
  const [ads, setAds] = useState<import("@/types/api").SupportAd[]>([])
```

### Step 5d — Replace `fetchFAQs` inline fetch with service call

**old_string**:
```
  const fetchFAQs = async (isInitialLoad = false) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=faqlist&category=${selectedCategory}&search=${searchTerm}`;
      const response = await fetch(url);
      const data = await response.json();
      setFaqs(data || []);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      setFaqs([]);
    } finally {
      if (isInitialLoad) {
        setInitialLoading(false);
      } else {
        setLoading(false);
      }
    }
  };
```

**new_string**:
```
  const fetchFAQs = async (isInitialLoad = false) => {
    try {
      const data = await getFaqsFiltered(selectedCategory, searchTerm);
      setFaqs(data);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      setFaqs([]);
    } finally {
      if (isInitialLoad) {
        setInitialLoading(false);
      } else {
        setLoading(false);
      }
    }
  };
```

### Step 5e — Replace `fetchAds` inline fetch with service call

**old_string**:
```
  const fetchAds = async () => {
    try {
      const userId = Cookies.get('userId');
      if (!userId) return;

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=fulladsnamelist&user_id=${userId}`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.status && Array.isArray(result.data)) {
        setAds(result.data);
      } else {
        setAds([]);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
      setAds([]);
    }
  };
```

**new_string**:
```
  const fetchAds = async () => {
    try {
      const userId = Cookies.get('userId');
      if (!userId) return;
      const data = await getFullAdsList(userId);
      setAds(data);
    } catch (error) {
      console.error("Error fetching ads:", error);
      setAds([]);
    }
  };
```

### Step 5f — Replace `handleSupportSubmit` inline fetch with service call

**old_string**:
```
  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const userId = Cookies.get('userId')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gofor: "needhelp",
          user_id: userId,
          description: formData.message,
          email: formData.email,
          category: formData.category,
          imgname: formData.imgname || ""
        })
      })

      if (response.ok) {
        toast.success('Support request submitted successfully!')
        setFormData({ name: "", email: "", category: "", message: "", imgname: "" })
      }
    } catch (error) {
      console.error("Error submitting support request:", error)
      toast.error('Failed to submit support request. Please try again.')
    } finally {
      setLoading(false)
    }
  }
```

**new_string**:
```
  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const userId = Cookies.get('userId')
      const payload: SupportRequestPayload = {
        user_id: userId || "",
        description: formData.message,
        email: formData.email,
        category: formData.category,
        imgname: formData.imgname || "",
      }
      await submitSupportRequest(payload)
      toast.success('Support request submitted successfully!')
      setFormData({ name: "", email: "", category: "", message: "", imgname: "" })
    } catch (error) {
      console.error("Error submitting support request:", error)
      toast.error('Failed to submit support request. Please try again.')
    } finally {
      setLoading(false)
    }
  }
```

### Step 5g — Replace `handleExpertCallSubmit` inline fetch with service call

**old_string**:
```
  const handleExpertCallSubmit = async (data: { prefdate: string; preftime: string; comments: string }) => {
    try {
      setLoading(true)
      const userId = Cookies.get('userId')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gofor: "exptalkrequest",
          user_id: userId,
          prefdate: data.prefdate,
          preftime: data.preftime,
          comments: data.comments
        })
      })

      if (response.ok) {
        toast.success('Expert call request submitted successfully!')
        setShowExpertDialog(false)
      } else {
        throw new Error('Failed to submit request')
      }
    } catch (error) {
      console.error("Error submitting expert call request:", error)
      toast.error('Failed to submit expert call request. Please try again.')
      throw error
    } finally {
      setLoading(false)
    }
  }
```

**new_string**:
```
  const handleExpertCallSubmit = async (data: { prefdate: string; preftime: string; comments: string }) => {
    try {
      setLoading(true)
      const userId = Cookies.get('userId')
      const payload: ExpertCallPayload = {
        user_id: userId || "",
        prefdate: data.prefdate,
        preftime: data.preftime,
        comments: data.comments,
      }
      await submitExpertCallRequest(payload)
      toast.success('Expert call request submitted successfully!')
      setShowExpertDialog(false)
    } catch (error) {
      console.error("Error submitting expert call request:", error)
      toast.error('Failed to submit expert call request. Please try again.')
      throw error
    } finally {
      setLoading(false)
    }
  }
```

### Step 5h — Replace `handleFeedbackSubmit` inline fetch with service call

**old_string**:
```
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const userId = Cookies.get('userId')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gofor: "feedback",
          user_id: userId,
          ad_upload_id: feedbackData.ad_upload_id,
          rating: feedbackData.rating,
          comments: feedbackData.comments
        })
      })

      if (response.ok) {
        toast.success('Feedback submitted successfully!')
        setFeedbackData({ ad_upload_id: "", rating: "", comments: "" })
        setShowFeedbackDialog(false)
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast.error('Failed to submit feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }
```

**new_string**:
```
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const userId = Cookies.get('userId')
      const payload: FeedbackPayload = {
        user_id: userId || "",
        ad_upload_id: feedbackData.ad_upload_id || "0",
        rating: feedbackData.rating,
        comments: feedbackData.comments,
      }
      await submitFeedback(payload)
      toast.success('Feedback submitted successfully!')
      setFeedbackData({ ad_upload_id: "", rating: "", comments: "" })
      setShowFeedbackDialog(false)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast.error('Failed to submit feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }
```

---

## Step 6 — UPDATE `src/app/myaccount/_components/policies.tsx`

**File**: `/Users/mugunthansrinivasan/Project/adalyze-ai/src/app/myaccount/_components/policies.tsx`

### Step 6a — Add service import

**old_string**:
```
import HtmlRenderer from "@/components/html-renderer";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
```

**new_string**:
```
import HtmlRenderer from "@/components/html-renderer";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPrivacyPolicy, getReturnPolicy, getTermsAndConditions } from "@/services/supportService";
```

### Step 6b — Replace the three inline fetches with service calls

> Note: Policy functions return `Promise<string>` via `.text()` — the service handles this. The component simply assigns the returned string directly.

**old_string**:
```
    const fetchPolicies = async () => {
      try {
        const [privacyRes, returnRes, termsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=privacypolicy`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=returnpolicy`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=termsandconditions`)
        ]);

        const privacyData = await privacyRes.text();
        const returnData = await returnRes.text();
        const termsData = await termsRes.text();

        setPrivacy(privacyData);
        setReturnPolicy(returnData);
        setTermsConditions(termsData);
      } catch (error) {
        console.error("Error fetching policies:", error);
      } finally {
        setLoading(false);
      }
    };
```

**new_string**:
```
    const fetchPolicies = async () => {
      try {
        const [privacyData, returnData, termsData] = await Promise.all([
          getPrivacyPolicy(),
          getReturnPolicy(),
          getTermsAndConditions(),
        ]);
        setPrivacy(privacyData);
        setReturnPolicy(returnData);
        setTermsConditions(termsData);
      } catch (error) {
        console.error("Error fetching policies:", error);
      } finally {
        setLoading(false);
      }
    };
```

---

## Step 7 — UPDATE `src/app/myaccount/_components/MyProfile.tsx`

**File**: `/Users/mugunthansrinivasan/Project/adalyze-ai/src/app/myaccount/_components/MyProfile.tsx`

### Step 7a — Add service import

**old_string**:
```
import { editProfile, addUserAgency, editUserAgency } from "@/services/userService"
import { uploadImage } from "@/services/uploadService"
import type { EditProfilePayload, AgencyPayload } from "@/types/api"
```

**new_string**:
```
import { editProfile, addUserAgency, editUserAgency } from "@/services/userService"
import { uploadImage } from "@/services/uploadService"
import { getCountries, getStates, getCities } from "@/services/referenceDataService"
import type { EditProfilePayload, AgencyPayload } from "@/types/api"
```

### Step 7b — Replace the `loadCountries` inline fetch with service call

**old_string**:
```
  // Fetch countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoadingCountries(true)
        const res = await fetch("https://techades.com/App/api.php?gofor=countrieslist")
        const data = await res.json()
        const mapped = (Array.isArray(data) ? data : []).map((c: any) => ({ id: String(c.id), name: String(c.name) }))
        setCountries(mapped)
      } catch (e) {
        console.error("Countries fetch error", e)
      } finally {
        setLoadingCountries(false)
      }
    }
    loadCountries()
  }, [])
```

**new_string**:
```
  // Fetch countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoadingCountries(true)
        const mapped = await getCountries()
        setCountries(mapped)
      } catch (e) {
        console.error("Countries fetch error", e)
      } finally {
        setLoadingCountries(false)
      }
    }
    loadCountries()
  }, [])
```

### Step 7c — Replace the `loadStates` inline fetch with service call

**old_string**:
```
  // Fetch states when country changes
  useEffect(() => {
    const loadStates = async () => {
      if (!selectedCountryId) {
        setStates([])
        setSelectedStateId("")
        return
      }
      try {
        setLoadingStates(true)
        const res = await fetch(`https://techades.com/App/api.php?gofor=stateslist&country_id=${encodeURIComponent(selectedCountryId)}`)
        const data = await res.json()
        const mapped = (Array.isArray(data) ? data : []).map((s: any) => ({ id: String(s.id), name: String(s.name) }))
        setStates(mapped)
```

**new_string**:
```
  // Fetch states when country changes
  useEffect(() => {
    const loadStates = async () => {
      if (!selectedCountryId) {
        setStates([])
        setSelectedStateId("")
        return
      }
      try {
        setLoadingStates(true)
        const mapped = await getStates(selectedCountryId)
        setStates(mapped)
```

### Step 7d — Replace the `loadCities` inline fetch with service call

**old_string**:
```
  // Fetch cities when state changes
  useEffect(() => {
    const loadCities = async () => {
      if (!selectedStateId) {
        setCities([])
        setSelectedCityId("")
        return
      }
      try {
        setLoadingCities(true)
        const res = await fetch(`https://techades.com/App/api.php?gofor=citieslist&state_id=${encodeURIComponent(selectedStateId)}`)
        const data = await res.json()
        const mapped = (Array.isArray(data) ? data : []).map((c: any) => ({ id: String(c.id), name: String(c.name) }))
        setCities(mapped)
```

**new_string**:
```
  // Fetch cities when state changes
  useEffect(() => {
    const loadCities = async () => {
      if (!selectedStateId) {
        setCities([])
        setSelectedCityId("")
        return
      }
      try {
        setLoadingCities(true)
        const mapped = await getCities(selectedStateId)
        setCities(mapped)
```

---

## Step 8 — UPDATE `src/app/myaccount/_components/feedback-form.tsx`

**File**: `/Users/mugunthansrinivasan/Project/adalyze-ai/src/app/myaccount/_components/feedback-form.tsx`

### Step 8a — Add service import

**old_string**:
```
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
```

**new_string**:
```
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { getFullAdsList, submitFeedback } from "@/services/supportService";
import type { FeedbackPayload } from "@/types/api";
```

### Step 8b — Remove local `Ad` and `AdsApiResponse` interfaces (now use `SupportAd` from service)

**old_string**:
```
interface Ad {
  ads_type: string
  ad_id: number
  ads_name: string
  image_path: string
  industry: string
  score: number
  platforms: string
  uploaded_on: string
  go_nogo?: string
}

interface AdsApiResponse {
  total: number
  limit: number
  offset: number
  ads: Ad[]
}
```

**new_string**:
```
```

> NOTE: The above new_string is intentionally empty — both local interfaces are deleted. The `ads` state type changes in the next step.

### Step 8c — Update `ads` state type to `SupportAd`

**old_string**:
```
  const [ads, setAds] = useState<Ad[]>([])
```

**new_string**:
```
  const [ads, setAds] = useState<import("@/types/api").SupportAd[]>([])
```

### Step 8d — Replace `fetchAds` inline fetch with service call

**old_string**:
```
  const fetchAds = async () => {
    try {
      if (!userId) return;

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=fulladsnamelist&user_id=${userId}`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.status && Array.isArray(result.data)) {
        setAds(result.data);
      } else {
        setAds([]);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
      setAds([]);
    }
  };
```

**new_string**:
```
  const fetchAds = async () => {
    try {
      if (!userId) return;
      const data = await getFullAdsList(userId);
      setAds(data);
    } catch (error) {
      console.error("Error fetching ads:", error);
      setAds([]);
    }
  };
```

### Step 8e — Replace `handleFeedbackSubmit` inline fetch with service call

**old_string**:
```
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gofor: "feedback",
          user_id: userId,
          ad_upload_id: feedbackData.ad_upload_id,
          rating: feedbackData.rating,
          comments: feedbackData.comments,
        }),
      });

      if (response.ok) {
        toast.success("Feedback submitted successfully!");
        setFeedbackData({ ad_upload_id: "", rating: "", comments: "" });
      } else {
        toast.error("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };
```

**new_string**:
```
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload: FeedbackPayload = {
        user_id: userId || "",
        ad_upload_id: feedbackData.ad_upload_id || "0",
        rating: feedbackData.rating,
        comments: feedbackData.comments,
      };
      await submitFeedback(payload);
      toast.success("Feedback submitted successfully!");
      setFeedbackData({ ad_upload_id: "", rating: "", comments: "" });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };
```

---

## Step 9 — UPDATE `src/app/myaccount/_components/interact.tsx`

**File**: `/Users/mugunthansrinivasan/Project/adalyze-ai/src/app/myaccount/_components/interact.tsx`

### Step 9a — Add service imports

**old_string**:
```
import Cookies from "js-cookie"
import toast from "react-hot-toast"
import ExpertConsultationPopup from "@/components/expert-form"
```

**new_string**:
```
import Cookies from "js-cookie"
import toast from "react-hot-toast"
import ExpertConsultationPopup from "@/components/expert-form"
import {
  getFullAdsList,
  getUserHelpList,
  getUserFeedbackList,
  getUserExpertTalkList,
  submitSupportRequest,
  submitFeedback,
  submitExpertCallRequest,
} from "@/services/supportService"
import type { SupportRequestPayload, FeedbackPayload, ExpertCallPayload } from "@/types/api"
```

### Step 9b — Remove local type definitions (replaced by imported types from api.ts)

**old_string**:
```
type SupportItem = {
  help_id: number
  email: string | null
  user_id: number
  category: string | null
  description: string | null
  comments?: string | null
  estatus?: string | null
  status?: number | string | null
  created_date?: string | null
  user_name?: string | null
}

type FeedbackItem = {
  fbid: number
  user_id: number
  ad_upload_id?: number
  rating?: number
  comments?: string | null
  status?: number | string | null
  created_date?: string | null
  user_name?: string | null
  ads_name?: string | null
}

type ExpertItem = {
  exptalk_id: number
  user_id: number
  prefdate?: string | null
  preftime?: string | null
  comments?: string | null
  estatus?: string | null
  status?: number | string | null
  created_date?: string | null
  modified_date?: string | null
  user_name?: string | null
}
```

**new_string**:
```
import type { SupportItem, FeedbackItem, ExpertTalkItem } from "@/types/api"

// ExpertItem is aliased locally for backwards compatibility with existing JSX refs
type ExpertItem = ExpertTalkItem
```

> NOTE: The existing JSX uses `ExpertItem` (not `ExpertTalkItem`). The alias preserves all existing render code without touching it.

### Step 9c — Remove local `interface Ad` (now typed as `SupportAd`)

**old_string**:
```
interface Ad {
  ad_id: number
  ads_name: string
}
```

**new_string**:
```
```

> NOTE: Intentionally empty — local Ad interface deleted. State type updated in next step.

### Step 9d — Update `ads` state type

**old_string**:
```
  const [ads, setAds] = useState<Ad[]>([])
```

**new_string**:
```
  const [ads, setAds] = useState<import("@/types/api").SupportAd[]>([])
```

### Step 9e — Replace the `Promise.all` load block with service calls

**old_string**:
```
  useEffect(() => {
    const load = async () => {
      try {
        const [a, b, c] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=userhelplist&user_id=${userId}`).then((r) => r.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=userfeedbacklist&user_id=${userId}`).then((r) => r.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=userexptalkreqlist&user_id=${userId}`).then((r) => r.json()),
        ])
        setSupport(Array.isArray(a?.data) ? a.data : [])
        setFeedbacks(Array.isArray(b?.data) ? b.data : [])
        setExperts(Array.isArray(c?.data) ? c.data : [])
      } catch {
        setSupport([])
        setFeedbacks([])
        setExperts([])
      }
    }
    load()
  }, [userId])
```

**new_string**:
```
  useEffect(() => {
    const load = async () => {
      try {
        const [supportData, feedbackData, expertData] = await Promise.all([
          getUserHelpList(userId),
          getUserFeedbackList(userId),
          getUserExpertTalkList(userId),
        ])
        setSupport(supportData)
        setFeedbacks(feedbackData)
        setExperts(expertData)
      } catch {
        setSupport([])
        setFeedbacks([])
        setExperts([])
      }
    }
    load()
  }, [userId])
```

### Step 9f — Replace `fetchAds` inline fetch with service call

**old_string**:
```
  const fetchAds = async () => {
    try {
      if (!userId) return

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=fulladsnamelist&user_id=${userId}`
      const response = await fetch(url)
      const result = await response.json()

      if (result.status && Array.isArray(result.data)) {
        setAds(result.data)
      } else {
        setAds([])
      }
    } catch (error) {
      console.error("Error fetching ads:", error)
      setAds([])
    }
  }
```

**new_string**:
```
  const fetchAds = async () => {
    try {
      if (!userId) return
      const data = await getFullAdsList(userId)
      setAds(data)
    } catch (error) {
      console.error("Error fetching ads:", error)
      setAds([])
    }
  }
```

### Step 9g — Replace `handleSupportSubmit` inline fetch + reload with service calls

**old_string**:
```
  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gofor: "needhelp",
          user_id: userId,
          description: supportFormData.message,
          email: supportFormData.email,
          category: supportFormData.category,
          imgname: supportFormData.imgname || ""
        })
      })

      if (response.ok) {
        toast.success("Support request submitted successfully!")
        setSupportFormData({ name: "", email: "", category: "", message: "", imgname: "" })
        setShowSupportDialog(false)
        // Reload support data
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=userhelplist&user_id=${userId}`)
        const data = await res.json()
        setSupport(Array.isArray(data?.data) ? data.data : [])
      }
    } catch (error) {
      console.error("Error submitting support request:", error)
      toast.error("Failed to submit support request. Please try again.")
    } finally {
      setLoading(false)
    }
  }
```

**new_string**:
```
  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const payload: SupportRequestPayload = {
        user_id: userId,
        description: supportFormData.message,
        email: supportFormData.email,
        category: supportFormData.category,
        imgname: supportFormData.imgname || "",
      }
      await submitSupportRequest(payload)
      toast.success("Support request submitted successfully!")
      setSupportFormData({ name: "", email: "", category: "", message: "", imgname: "" })
      setShowSupportDialog(false)
      // Reload support data
      const refreshed = await getUserHelpList(userId)
      setSupport(refreshed)
    } catch (error) {
      console.error("Error submitting support request:", error)
      toast.error("Failed to submit support request. Please try again.")
    } finally {
      setLoading(false)
    }
  }
```

### Step 9h — Replace `handleFeedbackSubmit` inline fetch + reload with service calls

**old_string**:
```
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate rating is required
    if (!feedbackFormData.rating || feedbackFormData.rating === "") {
      toast.error("Please select a rating")
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gofor: "feedback",
          user_id: userId,
          ad_upload_id: feedbackFormData.ad_upload_id,
          rating: feedbackFormData.rating,
          comments: feedbackFormData.comments,
        }),
      })

      if (response.ok) {
        toast.success("Feedback submitted successfully!")
        setFeedbackFormData({ ad_upload_id: "", rating: "", comments: "" })
        setShowFeedbackDialog(false)
        // Reload feedback data
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=userfeedbacklist&user_id=${userId}`)
        const data = await res.json()
        setFeedbacks(Array.isArray(data?.data) ? data.data : [])
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast.error("Failed to submit feedback. Please try again.")
    } finally {
      setLoading(false)
    }
  }
```

**new_string**:
```
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate rating is required
    if (!feedbackFormData.rating || feedbackFormData.rating === "") {
      toast.error("Please select a rating")
      return
    }

    try {
      setLoading(true)
      const payload: FeedbackPayload = {
        user_id: userId,
        ad_upload_id: feedbackFormData.ad_upload_id || "0",
        rating: feedbackFormData.rating,
        comments: feedbackFormData.comments,
      }
      await submitFeedback(payload)
      toast.success("Feedback submitted successfully!")
      setFeedbackFormData({ ad_upload_id: "", rating: "", comments: "" })
      setShowFeedbackDialog(false)
      // Reload feedback data
      const refreshed = await getUserFeedbackList(userId)
      setFeedbacks(refreshed)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast.error("Failed to submit feedback. Please try again.")
    } finally {
      setLoading(false)
    }
  }
```

### Step 9i — Replace `handleExpertCallSubmit` inline fetch + reload with service calls

**old_string**:
```
  const handleExpertCallSubmit = async (data: { prefdate: string; preftime: string; comments: string }) => {
    try {
      setLoading(true)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gofor: "exptalkrequest",
          user_id: userId,
          prefdate: data.prefdate,
          preftime: data.preftime,
          comments: data.comments
        })
      })

      if (response.ok) {
        toast.success("Expert call request submitted successfully!")
        setShowExpertDialog(false)
        // Reload expert data
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=userexptalkreqlist&user_id=${userId}`)
        const result = await res.json()
        setExperts(Array.isArray(result?.data) ? result.data : [])
      } else {
        throw new Error('Failed to submit request')
      }
    } catch (error) {
      console.error("Error submitting expert call request:", error)
      toast.error("Failed to submit expert call request. Please try again.")
      throw error
    } finally {
      setLoading(false)
    }
  }
```

**new_string**:
```
  const handleExpertCallSubmit = async (data: { prefdate: string; preftime: string; comments: string }) => {
    try {
      setLoading(true)
      const payload: ExpertCallPayload = {
        user_id: userId,
        prefdate: data.prefdate,
        preftime: data.preftime,
        comments: data.comments,
      }
      await submitExpertCallRequest(payload)
      toast.success("Expert call request submitted successfully!")
      setShowExpertDialog(false)
      // Reload expert data
      const refreshed = await getUserExpertTalkList(userId)
      setExperts(refreshed)
    } catch (error) {
      console.error("Error submitting expert call request:", error)
      toast.error("Failed to submit expert call request. Please try again.")
      throw error
    } finally {
      setLoading(false)
    }
  }
```

---

## Step 10 — Verification Commands

Run these from `/Users/mugunthansrinivasan/Project/adalyze-ai` after all edits are applied.

### 10a — Confirm no raw fetch calls remain in migrated files (should return 0 results)

```bash
grep -n "process.env.NEXT_PUBLIC_API_BASE_URL.*api\.php" \
  src/app/support/page.tsx \
  src/app/myaccount/_components/policies.tsx \
  src/app/myaccount/_components/feedback-form.tsx \
  src/app/myaccount/_components/interact.tsx
```

### 10b — Confirm no hardcoded techades.com URLs remain in MyProfile.tsx

```bash
grep -n "techades\.com" src/app/myaccount/_components/MyProfile.tsx
```

### 10c — Confirm Cookies.get does NOT appear in service files

```bash
grep -rn "Cookies\.get" \
  src/services/supportService.ts \
  src/services/contentService.ts \
  src/services/referenceDataService.ts
```

### 10d — Confirm axiosInstance is NOT imported in supportService.ts

```bash
grep -n "axiosInstance\|axios" src/services/supportService.ts
```

### 10e — Confirm policy functions use .text() not .json()

```bash
grep -A3 "getPrivacyPolicy\|getReturnPolicy\|getTermsAndConditions" \
  src/services/supportService.ts | grep -E "\.text\(\)|\.json\(\)"
```

Expected: three `.text()` lines, zero `.json()` lines for these functions.

### 10f — Confirm GeoItem is exported from types/api.ts

```bash
grep "export interface GeoItem" src/types/api.ts
```

### 10g — TypeScript check (no new errors)

```bash
npx tsc --noEmit 2>&1 | head -40
```

---

## Service-Route Compatibility Matrix

| Call site | Component method | Service function | Service file | Replacement complete |
|-----------|-----------------|-----------------|-------------|---------------------|
| support/page.tsx fetchFAQs | `fetchFAQs()` | `getFaqsFiltered(category, search)` | contentService.ts | Step 5d |
| support/page.tsx fetchAds | `fetchAds()` | `getFullAdsList(userId)` | supportService.ts | Step 5e |
| support/page.tsx handleSupportSubmit | `handleSupportSubmit()` | `submitSupportRequest(payload)` | supportService.ts | Step 5f |
| support/page.tsx handleExpertCallSubmit | `handleExpertCallSubmit()` | `submitExpertCallRequest(payload)` | supportService.ts | Step 5g |
| support/page.tsx handleFeedbackSubmit | `handleFeedbackSubmit()` | `submitFeedback(payload)` | supportService.ts | Step 5h |
| policies.tsx fetchPolicies | `getPrivacyPolicy()` | `getPrivacyPolicy()` | supportService.ts | Step 6b |
| policies.tsx fetchPolicies | `getReturnPolicy()` | `getReturnPolicy()` | supportService.ts | Step 6b |
| policies.tsx fetchPolicies | `getTermsAndConditions()` | `getTermsAndConditions()` | supportService.ts | Step 6b |
| MyProfile.tsx loadCountries | `loadCountries()` | `getCountries()` | referenceDataService.ts | Step 7b |
| MyProfile.tsx loadStates | `loadStates()` | `getStates(countryId)` | referenceDataService.ts | Step 7c |
| MyProfile.tsx loadCities | `loadCities()` | `getCities(stateId)` | referenceDataService.ts | Step 7d |
| feedback-form.tsx fetchAds | `fetchAds()` | `getFullAdsList(userId)` | supportService.ts | Step 8d |
| feedback-form.tsx handleFeedbackSubmit | `handleFeedbackSubmit()` | `submitFeedback(payload)` | supportService.ts | Step 8e |
| interact.tsx mount load | `load()` | `getUserHelpList(userId)` | supportService.ts | Step 9e |
| interact.tsx mount load | `load()` | `getUserFeedbackList(userId)` | supportService.ts | Step 9e |
| interact.tsx mount load | `load()` | `getUserExpertTalkList(userId)` | supportService.ts | Step 9e |
| interact.tsx fetchAds | `fetchAds()` | `getFullAdsList(userId)` | supportService.ts | Step 9f |
| interact.tsx handleSupportSubmit | `handleSupportSubmit()` | `submitSupportRequest(payload)` | supportService.ts | Step 9g |
| interact.tsx handleSupportSubmit reload | inline reload | `getUserHelpList(userId)` | supportService.ts | Step 9g |
| interact.tsx handleFeedbackSubmit | `handleFeedbackSubmit()` | `submitFeedback(payload)` | supportService.ts | Step 9h |
| interact.tsx handleFeedbackSubmit reload | inline reload | `getUserFeedbackList(userId)` | supportService.ts | Step 9h |
| interact.tsx handleExpertCallSubmit | `handleExpertCallSubmit()` | `submitExpertCallRequest(payload)` | supportService.ts | Step 9i |
| interact.tsx handleExpertCallSubmit reload | inline reload | `getUserExpertTalkList(userId)` | supportService.ts | Step 9i |

**Total call sites migrated**: 20 (matches BA inventory)
**New service files created**: 1 (`supportService.ts`)
**Existing service files extended**: 2 (`contentService.ts` +1 fn, `referenceDataService.ts` +3 fns)
**New type interfaces**: 9 (in `src/types/api.ts`)
