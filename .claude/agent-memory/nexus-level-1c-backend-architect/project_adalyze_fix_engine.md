---
name: Adalyze Fix Engine — Backend Integration Facts
description: Confirmed API contracts and architecture decisions for the Fix Engine POC and production build
type: project
---

analyze.php accepts JSON POST with these required fields: user_id, ads_name, industry, platform, age, gender, country, ad_type, brand_id, images (array of public URLs). Optional: language, objective, funnel_stage, extracted_text. Every call creates a new ad_upload_id record — there is no re-run-against-existing mode.

adupl.php accepts multipart FormData (file + user_id) and returns { status, fileUrl, extracted_text }. Image URLs are public, served directly from adalyzeai.xyz/App/[path]. Exact path unknown until a live fileUrl is observed.

api.php?gofor=addetail returns ApiResponse but ads_name is NOT in the TypeScript type — may be absent from the response. This is a data gap for fix.php re-analysis.

All PHP endpoints return permissive CORS headers (calls succeed from Next.js static export without proxy). fix.php must include the same headers.

**Why:** Architecture review for the Fix Engine Feasibility POC dated 2026-04-04.

**How to apply:** Use the confirmed analyze.php field list as the authoritative contract when designing fix.php or any test script. Do not re-derive from frontend code — it is captured here. Treat credit deduction on internal re-analysis as the top unresolved risk until F3.4 is tested.
