# Compliance Review — api-svc-004
**Sprint 4: Service Layer Refactor (API Migration)**  
**Task ID**: api-svc-004 | **Date**: 2026-04-11 | **Agent**: nexus:level-1b:law-governance

---

## Executive Summary

This is a **pure refactor with zero new data collection or endpoints**. All compliance concerns are **pre-existing** (inherited from Sprint 1–3). No new legal risk is introduced.

**Result**: APPROVED. Proceed with implementation.

---

## Scope Assessment

### What's Changing
- Inline `fetch()` calls → typed service functions
- No new endpoints, no new data flows, no new user-facing features
- Existing authentication and session handling unchanged
- All external API calls (`techades.com` locationlist) unchanged in transport

### Compliance Domains in Play
1. **Data retention & PII handling** — no change
2. **External API terms (techades.com)** — no change to usage
3. **Authentication & session security** — no change
4. **No CAN-SPAM, no GDPR data processing** — N/A (internal SaaS tool)

---

## Findings

### 1. **External API Call: techades.com (locationlist)**

**BR-003 states**: Raw fetch with hardcoded URL `https://techades.com/App/api.php?gofor=locationlist&search=${searchTerm}`.

**Legal requirement**: Verify techades.com API Terms of Service compliance.

**Status**: ✓ **No new risk**. This call exists in current code (line 234, `ab-test/page.tsx`). Sprint 4 only encapsulates it in a service function; transport and usage unchanged. Existing compliance posture is inherited.

**Action for Implementation**: Architect/Lead must confirm techades.com API agreement includes `locationlist` usage rights and rate limits. If not already documented, escalate to the product owner.

---

### 2. **User Identifiers in Query Parameters (user_id)**

**BR-008 states**: `getAdDetail` accepts optional `userId`. When absent or empty, `user_id` must be **omitted** from request params (not sent as empty string).

**Compliance concern**: PII (user_id) passed in query strings is logged by intermediaries (servers, proxies, CDNs). Query string logging is a known vector for PII leakage.

**Status**: ✓ **Mitigated by existing Sprint 1–3 pattern**. `axiosInstance` (configured Sprint 1) handles all authenticated calls via POST or request body, not query params, wherever sensitive data is involved. The `user_id` param here is for backend filtering, not auth (auth is in the Authorization header via axiosInstance interceptors).

**Action for Implementation**: Dev must ensure `user_id` is conditionally omitted (not sent as `""` or `null`). QA must verify HTTP logs show no `user_id=undefined` in query strings.

---

### 3. **CORS & External Domain (techades.com)**

**Compliance concern**: Browser CORS requests to external domains expose origin, user agent, and request timing metadata. If techades.com logs these, it creates a cross-domain tracking vector.

**Status**: ✓ **Pre-existing**. Current code already makes this call. Sprint 4 does not change transport or domain. If CORS is already an issue, it is out-of-scope for this sprint.

**Action for Implementation**: Confirm CORS policy with techades.com API owner. No change needed for Sprint 4.

---

### 4. **No CAN-SPAM, GDPR, or Data Retention Risk**

- **CAN-SPAM**: Not applicable (no email features in this refactor)
- **GDPR**: Not applicable (no new cross-border data movement; internal user data only)
- **Data retention**: No new data collected; no new TTLs or deletion policies needed

---

## Mandatory Legal Acceptance Criteria (LACs)

Add these to the Architect and QA review gates:

1. **LAC-001**: `user_id` is never sent in query strings as an empty/undefined value. Dev must strip undefined params before passing to axiosInstance.
2. **LAC-002**: `referenceDataService.ts` must include a comment block documenting why `locationlist` uses raw fetch (external domain, not proxied) and explicitly stating that no authenticated calls will ever be added to this service.
3. **LAC-003**: QA must verify HTTP audit logs show no `user_id=undefined` or `user_id=""` in query strings across any of the 4 refactored pages.
4. **LAC-004**: Architect must confirm in the design doc that techades.com API agreement permits `locationlist` queries from this application domain.

---

## No Tech Debt Deferred

All compliance concerns are pre-existing. No new legal tech debt is introduced.

---

## Recommendation

**Status**: ✓ **APPROVED**  
Proceed to Architect review. Add the 4 LACs above to the acceptance criteria for Dev and QA gates.
