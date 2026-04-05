# Backend Architecture Review — Fix Engine Feasibility POC
## Integration Points Assessment

**Reviewer**: Backend Architect (Nexus Level 1C)
**Date**: 2026-04-04
**Input**: plan-nogo-fix-engine-feasibility.md + frontend source analysis
**Scope**: PHP server, API contracts, re-analysis loop — feasibility only

---

## Area 1: analyze.php Re-Analysis Feasibility

**Assessment**: Risky

**Evidence from source**

The analyze.php call in `upload/page.tsx` (lines 762-766) sends a JSON body with this shape:

```
{
  user_id:        string   (from cookie)
  ads_name:       string   (ad name, required — validated before call)
  industry:       string   (from target panel)
  platform:       string   (from target panel)
  age:            string   ("minAge-maxAge")
  gender:         string
  country:        string   (country *name*, not ID)
  ad_type:        "Single" | "Carousel" | "Video"
  brand_id:       string   ("0" for free trial, brand ID otherwise)
  language:       string   (optional)
  objective:      string   (optional)
  funnel_stage:   string   (optional)
  images:         string[] (array of public URLs, for single/carousel)
  extracted_text: string   (optional, OCR text from image — single/carousel only)
  screenshots:    string[] (video only)
  video:          File     (video only)
  duration:       number   (video only)
  transcript:     string   (video only)
}
```

The response, on success, returns `{ success: true, data: ApiResponse }` where `data.ad_upload_id` is a new integer ID. The frontend immediately generates a token from this ID and redirects to `/results`. This confirms that **every analyze.php call creates a new ad_upload_id record** — there is no "re-run against an existing record" mode visible from the frontend contract.

**Specific risks for re-analysis**

1. **New ad_upload_id per call**: fix.php calling analyze.php for re-analysis will create a new DB record, not annotate the original. The re-analysis result will be orphaned unless fix.php explicitly links it back to the original `ad_upload_id`. This is a schema design question the POC cannot answer alone — it requires knowledge of the PHP/DB internals.

2. **Metadata reconstruction is possible but incomplete**: All required metadata fields (`user_id`, `industry`, `platform`, `age`, `gender`, `country`, `brand_id`) are present in the original `ApiResponse` type (confirmed in `results/type.ts`). fix.php can reconstruct them from an `api.php?gofor=addetail` call on the original `ad_upload_id`. However, `ads_name` is not in `ApiResponse` — fix.php would need to generate a synthetic name (e.g., "Fixed: {original ads_name}") or the DB stores it elsewhere. The `extracted_text` field also cannot be reconstructed from the original record without re-running OCR; fix.php should pass the OCR text from the original record if available, or omit it.

3. **Server-generated image**: analyze.php receives image URLs, not file uploads — the image field is `images: string[]` of public URLs. A server-generated image saved to disk with a public URL is structurally identical to a user-uploaded image from analyze.php's perspective. This is the one clear GO signal: **the image input mechanism is URL-based, not upload-based, so a generated image can be passed in the same way as an original image.**

4. **Credit consumption is unknown**: The frontend has credit-gate logic (free trial overlays, `adsLimit` checks) before calling analyze.php, but this is client-side enforcement only. Whether analyze.php deducts a credit server-side for every call — including internal server-to-server calls — cannot be determined from the frontend code. **This is the highest risk item for the re-analysis loop.**

**Recommendation for POC**

F3.1 (exact input requirements) is answered above — use the field list above as the contract.
F3.2 (test with programmatic image URL): pass a publicly-accessible test image URL, all other fields populated with realistic values. No shortcuts.
F3.3 (new ad_upload_id vs annotation): observe the response and confirm whether a new record is created. This shapes the production data model entirely.
F3.4 (credit consumption): test with a known credit balance before and after. Critical for business viability.

**Production Consideration**

fix.php will need a dedicated internal call path to analyze.php that bypasses the credit deduction, OR analyze.php needs a server-to-server auth token that signals "internal re-analysis — no credit charge." This is a production-only concern but must be flagged now. If internal calls consume credits, the Fix Engine business model is broken (users pay twice per fix attempt).

---

## Area 2: Image Storage and Serving

**Assessment**: Unknown (requires server-side verification)

**Evidence from source**

The upload flow in `upload/page.tsx` calls `adupl.php` with a multipart FormData body (`file` + `user_id`). The response returns `{ status: "Ads Uploaded Successfully", fileUrl: string, extracted_text: string }`. The `fileUrl` is then passed directly into analyze.php's `images` array.

The `ApiResponse` type's `images` field is `string[]` — these are the same public URLs returned by adupl.php and stored in the DB. The results page renders them directly as `<img src={images[currentImageIndex]}>` without any proxy, CDN prefix rewrite, or signed-URL logic.

The base URL for all API calls is hardcoded as `https://adalyzeai.xyz/App/` (confirmed in next.config.mjs and all fetch calls). This strongly suggests the file storage is on the same server, with a path like `https://adalyzeai.xyz/App/uploads/` or `https://adalyzeai.xyz/uploads/`. The exact path is not determinable from the frontend.

**Recommendation for POC**

F4.5 (file upload/serve path): inspect one real `fileUrl` value from a live adupl.php response to confirm the URL structure. The POC script that calls adupl.php with a test image will reveal this immediately — read the `fileUrl` from the response.

For the Nano Banana base64 output: fix.php must `base64_decode()` the image, write it to the same directory that adupl.php uses, and construct a URL using the same pattern. The POC does not need to do this automatically, but the path must be identified.

**Production Consideration**

If the server uses a randomized filename (common for security), fix.php must generate a unique filename for each generated image — UUID or `uniqid()` is sufficient. The filename should be prefixed (e.g., `fix_`) to distinguish generated images from user uploads in the DB. Storage cleanup policy (are old fix images purged?) is a production ops concern.

---

## Area 3: fix.php Endpoint Design

**Assessment**: Synchronous is Blocked; Async with polling is Feasible

**Evidence from source**

The frontend is a Next.js static export (`output: 'export'` in next.config.mjs). There is no server-side API route — the frontend calls PHP endpoints directly. All existing calls (analyze.php, compliance.php, askadalyze.php, heatmap.php) are synchronous fetch calls with no polling, webhook, or streaming mechanism visible in the codebase.

The existing analyze.php call itself blocks the UI — the frontend shows an `AnalyzingOverlay` component while waiting for the response (state `isAnalyzing`). The user sits on the upload page until the full analysis returns.

Estimated latency:
- Step 1 (Claude vision): 3–5 seconds
- Step 2 (Nano Banana): 5–10 seconds
- Step 3 (re-analysis via analyze.php): 10–20 seconds (same order as original analysis)
- Total: 18–35 seconds, worst case approaching 45 seconds

**Verdict**: A synchronous endpoint blocking for 35+ seconds is technically possible in PHP (no default timeout on the server prevents it — though PHP CLI and Apache/nginx have `max_execution_time` defaults of 30s that must be overridden). However, it is a poor user experience and risks timeout from nginx proxy (typically 60s) or the browser's own timeout.

A polling pattern is the correct approach:
1. POST to `fix.php` → returns `{ fix_id: "abc123", status: "pending" }` immediately
2. Frontend polls `fix_status.php?fix_id=abc123` every 3 seconds
3. fix.php runs the pipeline as a background PHP process (via `exec()` with `&` or a queue)

However, **for the POC, synchronous is acceptable** because the goal is validating integration, not UX. The POC script runs from command line — no HTTP timeout concern.

**POC script language**: Python is the better choice. Python's `requests`, `anthropic`, and `google-generativeai` libraries are well-documented and fast to prototype with. PHP would be closer to production but adds noise (cURL verbosity, SDK uncertainty). The POC is about proving the pipeline works, not proving the PHP implementation. Build the POC in Python; translate to PHP only after GO verdict.

**Recommendation for POC**

Build 4 Python scripts as planned. Do not build a PHP prototype — that is the Lead's job after the GO verdict.
For F4.2 and F4.3 (outbound HTTPS from server): test this separately from the Python scripts. Run a simple `curl` from the adalyzeai.xyz server to api.anthropic.com and generativelanguage.googleapis.com. This is a 2-minute server-side check.

**Production Consideration**

fix.php must have `set_time_limit(120)` or be restructured as async (background process + polling endpoint). The nginx proxy timeout must be configured if synchronous is chosen. The polling pattern is strongly recommended — it also enables progress indicators in the UI ("Generating fix spec... Generating image... Re-analyzing..."), which is a materially better UX for a 30-second operation.

---

## Area 4: Internal API Call Pattern

**Assessment**: Unknown (architecture decision — both options are viable)

**Evidence from source**

Not determinable from the frontend. The PHP monolith is at `adalyzeai.xyz/App/`. Whether analyze.php is structured as an includable module (function-based PHP) or a standalone HTTP-only endpoint is unknown without the server source.

**Option A: Internal HTTP call (fix.php calls analyze.php via curl to itself)**

Pros: Zero code change to analyze.php; guaranteed same behavior as external calls.
Cons: Extra network hop (loopback); possible port/vhost complications; does not bypass credit deduction.

Option A is the POC approach — it requires no server code knowledge. The script calls `https://adalyzeai.xyz/App/analyze.php` from a test environment with a real image URL. This proves the interface works. The production question of whether to use loopback or direct function call can be deferred.

**Option B: Direct function call (analyze_core() included in fix.php)**

Pros: No network overhead; can bypass credit deduction by passing an `is_internal` flag.
Cons: Requires refactoring analyze.php into a callable module; risk of introducing bugs in a working endpoint.

**Recommendation for POC**

F3.2 should use Option A (external HTTP call from the POC Python script). This tests the HTTP interface directly and is sufficient for feasibility validation.

**Production Consideration**

Option B is the architecturally correct production choice if the PHP code structure allows it. It avoids the credit problem and the loopback overhead. If analyze.php is a 1000-line procedural script with no function extraction, Option A (internal HTTP) is the pragmatic fallback. The Codebase Analyst agent in Phase 1 should ask Muguntha for read access to analyze.php to determine which option is viable.

---

## Area 5: Data Flow Completeness

**Assessment**: Mostly complete, with one confirmed gap and one risk

**Complete data flow**

```
Input:
  ad_upload_id (original)     → from frontend
  user_id                     → from frontend / auth cookie

Step 0 (fix.php setup):
  call api.php?gofor=addetail&ad_upload_id={original_id}
  → retrieves: images[], industry, platform, age, gender, country,
               brand_id, go_no_go, issues[], critical_issues[], score_out_of_100,
               dominant_colors[], suggested_colors[], font_feedback,
               user_id, ad_type
  
  NOTE: ads_name NOT in ApiResponse — must generate synthetic name
  NOTE: extracted_text NOT in ApiResponse — omit or re-derive

Step 1 (Claude Vision):
  Input:  images[0] URL + issues[] + critical_issues[] + go_no_go verdict
          + dominant_colors[] + suggested_colors[] + font_feedback
          + score_out_of_100 + platform + industry
  Output: fix_spec JSON { copy_fixes, visual_direction, color_palette,
                          layout_changes, cta_changes }

Step 2 (Nano Banana):
  Input:  fix_spec (converted to structured text prompt)
          + reference image: images[0] URL
  Output: base64 PNG

Step 2.5 (fix.php — image save):
  base64_decode → write to server storage → construct public URL
  fixed_image_url = "https://adalyzeai.xyz/[uploads_path]/fix_{uuid}.png"

Step 3 (Re-analysis):
  call analyze.php POST with:
    images: [fixed_image_url]
    user_id: {from original}
    industry, platform, age, gender, country, brand_id: {from original record}
    ads_name: "Fixed: {original ads_name or 'Ad Fix'}"
    ad_type: "Single"
    extracted_text: omitted (unknown for generated image)
  Output: new ApiResponse with new ad_upload_id + new go_no_go + new score_out_of_100

Final response from fix.php:
  {
    original_ad_upload_id:  number,
    fixed_ad_upload_id:     number,      ← the new record from re-analysis
    fix_spec:               object,
    fixed_image_url:        string,
    original_score:         number,
    fixed_score:            number,
    original_verdict:       string,      ← "No Go"
    fixed_verdict:          string,      ← "Go" or "No Go"
    improvement_delta:      number       ← fixed_score - original_score
  }
```

**Confirmed data gap**

`ads_name` is required by analyze.php (the frontend validates for it before calling) but is not returned in `ApiResponse`. This means fix.php cannot reconstruct the original ad name from `api.php?gofor=addetail`. The POC must use a placeholder name. Production fix.php should either: (a) accept `ads_name` as an input parameter from the frontend, or (b) verify whether addetail actually returns it (the TypeScript type may be incomplete).

**"No Go again" response**

If the re-analysis returns `go_no_go: "No Go"`, fix.php should still return the full response — the frontend decides what to show the user. The response shape above handles this: `fixed_verdict: "No Go"` and a negative or small `improvement_delta` tells the story. The user sees both scores and decides whether to try again. The POC should explicitly test this scenario by verifying the response structure is the same regardless of verdict.

**Recommendation for POC**

F5.4 (document complete request/response chain): use the data flow above as the skeleton. The POC should produce a JSON log of every step's input and output — this becomes the specification document for the Lead.

---

## Area 6: Missing Backend Concerns

### API Key Management

**Assessment**: Unknown — requires server access

**Evidence**: No API key references in the frontend codebase. All API calls originate from the PHP server to Anthropic and Google AI. The PHP monolith presumably uses constants or environment variables (`.env` file or PHP `define()` constants).

**Recommendation**: For the POC Python scripts, keys are stored in a `.env` file in the POC directory, never committed (plan anti-requirement 4 covers this). For production fix.php, keys must be stored identically to wherever the existing PHP endpoints store their keys (ask Muguntha). If the server uses a shared config file (e.g., `config.php`), fix.php should include the same file — no duplication.

---

### Rate Limiting

**Assessment**: Unknown from frontend; likely absent at server level

**Evidence**: No retry logic, backoff, or rate-limit error handling is visible in any frontend fetch call. All calls are fire-and-forget with a single try/catch. This suggests either: (a) the backend has no rate limiting, or (b) it rate-limits at a higher level (nginx, PHP session checks) that is transparent to the frontend.

**Production Consideration**: The Fix Engine pipeline calls 3 external APIs in sequence. If Nano Banana or Claude returns a 429, the pipeline must handle it explicitly. A simple retry-with-backoff (3 attempts, 2s exponential) is sufficient for production. The POC does not need retry logic but should log the HTTP status code of each API call explicitly.

---

### Error Handling — Mid-Pipeline Failures

**Assessment**: Risky — no recovery pattern exists in the current codebase

**Evidence**: No existing PHP endpoint in the Adalyze stack has a multi-step pipeline — every endpoint is a single API call. fix.php will be the first one with 3 dependent steps. If Step 2 (Nano Banana) fails, Step 3 cannot proceed. If Step 3 (re-analysis) fails, the generated image has already been written to disk.

**Recommendation for POC**: The POC should deliberately test failure cases: what does Claude return for a non-ad image? What does Nano Banana return for an over-constrained prompt? These failures shape the error contract.

**Production Consideration**: fix.php needs explicit failure modes:
- Step 1 fail: return `{ error: "fix_spec_generation_failed", detail: "..." }` — no image generated, no DB write
- Step 2 fail: return `{ error: "image_generation_failed", fix_spec: {...} }` — fix spec available but no image
- Step 3 fail: return `{ error: "reanalysis_failed", fix_spec: {...}, fixed_image_url: "..." }` — image generated but unscored; delete the file or keep it depending on the business decision

---

### CORS

**Assessment**: Not a concern for fix.php; understood pattern confirmed

**Evidence**: All existing PHP endpoints (`analyze.php`, `compliance.php`, `askadalyze.php`, `heatmap.php`, `adupl.php`, `api.php`) are called directly from the Next.js frontend without a proxy. The calls succeed, which means the PHP server already returns permissive CORS headers (`Access-Control-Allow-Origin: *` or the specific frontend domain).

fix.php must include the same CORS headers. Since no proxy is in use, this is simply a copy of the header pattern from any existing PHP endpoint on the server. No new CORS configuration needed.

---

## Prioritized Backend Risks for the POC

Listed by severity — address in this order when designing the test scripts.

**CRITICAL**

1. **Credit deduction on internal re-analysis** (Area 1, F3.4): If analyze.php deducts a user credit for every call including server-originated ones, the Fix Engine business model is non-viable without a server-side change to analyze.php. This must be tested before any other integration work. Use a test account with a known credit balance.

2. **PHP max_execution_time** (Area 3, F4.1): Default PHP execution limit is 30 seconds on most shared hosts. The pipeline may take 35+ seconds. If `set_time_limit()` is restricted (some hosts disallow it), synchronous fix.php is impossible and the polling architecture becomes mandatory. Test this before writing any PHP code.

3. **Outbound HTTPS from server** (Area 3, F4.2/F4.3): If the server blocks outbound calls to api.anthropic.com or generativelanguage.googleapis.com, the pipeline is blocked entirely. This is a 5-minute check from the server. Do it first.

**HIGH**

4. **ads_name missing from addetail response** (Area 5): The analyze.php contract requires `ads_name` but it is absent from the `ApiResponse` TypeScript type. If the addetail endpoint truly does not return it, fix.php cannot reconstruct a meaningful name and must either accept it as an input parameter or use a placeholder. The POC should log the raw addetail response to verify.

5. **New ad_upload_id per re-analysis** (Area 1, F3.3): Each analyze.php call creates a new DB record. The frontend and DB must be designed to link the original record to its fixed version. This is not a POC blocker but it is a production schema decision that must be made before building fix.php in production.

**MEDIUM**

6. **Nano Banana image quality** (plan-identified kill switch): Already noted as the plan's primary kill switch. No new insight from the frontend analysis — confirm this in F2.2/F2.3/F2.4.

7. **Image URL structure** (Area 2): The exact path where adupl.php saves files is unknown. Until the first POC script runs and a real `fileUrl` is observed, fix.php cannot construct the correct path for saving generated images. Resolve in F4.5 by reading a live adupl.php response.

**LOW**

8. **Composer/SDK availability** (F4.4): The POC uses Python so this is not an immediate concern. Relevant only when the Lead builds the PHP production implementation.

---

## Summary for Phase 1 Agent Dispatch

The Codebase Analyst agent in Phase 1 should be given the confirmed analyze.php request shape from this review (no need to re-derive it from the frontend) and focused on the two unknowns that remain:
- Does addetail return `ads_name`?
- What is the credit deduction mechanism in analyze.php (is it bypassable)?

Both questions require either PHP source access or a targeted test against the live server. If Muguntha can provide read access to analyze.php and api.php's addetail branch before Phase 1 runs, the Codebase Analyst's work becomes confirmatory rather than exploratory — saving at least one iteration.
